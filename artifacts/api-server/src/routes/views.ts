import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import { Router, type IRouter, type Request, type Response } from "express";
import { count, desc } from "drizzle-orm";
import { db, viewsTable } from "@workspace/db";
import {
  ExportViewsJsonResponse,
  GetViewCountResponse,
  GetViewsAdminResponse,
  LoginViewsAdminBody,
  LoginViewsAdminResponse,
  LogoutViewsAdminResponse,
  RecordViewResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();
const COOKIE = "brimas_views_admin";
const SESSION_LENGTH_MS = 12 * 60 * 60 * 1000;
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 5;
const failedLogins = new Map<string, { count: number; until: number }>();

router.use((_req, res, next) => {
  res.setHeader("Cache-Control", "no-store");
  next();
});

function viewCount() {
  return db.select({ count: count() }).from(viewsTable).then(([row]) => row?.count ?? 0);
}

function sessionSignature(expires: string, secret: string) {
  return createHmac("sha256", secret).update(`brimas-views-admin:${expires}`).digest("base64url");
}

function isAdmin(req: Request) {
  const secret = process.env.SESSION_SECRET;
  if (!secret) return false;
  const raw = req.headers.cookie?.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${COOKIE}=`))?.slice(COOKIE.length + 1);
  if (!raw) return false;
  const [expires, signature, extra] = raw.split(".");
  if (!expires || !signature || extra || !Number.isFinite(Number(expires)) || Number(expires) < Date.now()) return false;
  const expected = Buffer.from(sessionSignature(expires, secret));
  const received = Buffer.from(signature);
  return expected.length === received.length && timingSafeEqual(expected, received);
}

function requireAdmin(req: Request, res: Response) {
  if (isAdmin(req)) return true;
  res.status(401).json({ error: "Admin sign-in required" });
  return false;
}

function sameOrigin(req: Request) {
  const origin = req.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).host === req.get("host");
  } catch {
    return false;
  }
}

function loginKey(req: Request) {
  return req.ip ?? req.socket.remoteAddress ?? "unknown";
}

function serializeVisit(row: typeof viewsTable.$inferSelect) {
  return { id: row.id, ip: row.ip, timestamp: row.visitedAt.toISOString(), userAgent: row.userAgent };
}

router.get("/views", async (_req, res): Promise<void> => {
  res.json(GetViewCountResponse.parse({ count: await viewCount() }));
});

router.post("/views", async (req, res): Promise<void> => {
  if (!sameOrigin(req)) {
    res.status(403).json({ error: "Invalid origin" });
    return;
  }
  await db.insert(viewsTable).values({
    ip: (req.ip ?? req.socket.remoteAddress ?? "unknown").slice(0, 45),
    userAgent: (req.get("user-agent") ?? "Unknown").slice(0, 512),
  });
  res.status(201).json(RecordViewResponse.parse({ count: await viewCount() }));
});

router.post("/views/admin/login", async (req, res): Promise<void> => {
  if (!sameOrigin(req)) {
    res.status(403).json({ error: "Invalid origin" });
    return;
  }
  const password = process.env.BRIMAS_VIEWS_PASSWORD;
  const secret = process.env.SESSION_SECRET;
  if (!password || !secret) {
    res.status(503).json({ error: "Admin access is not configured" });
    return;
  }
  const parsed = LoginViewsAdminBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Enter a password" });
    return;
  }
  const key = loginKey(req);
  const now = Date.now();
  const failure = failedLogins.get(key);
  if (failure && failure.until > now && failure.count >= MAX_ATTEMPTS) {
    res.status(429).json({ error: "Too many attempts. Try again later." });
    return;
  }
  const expected = createHash("sha256").update(password).digest();
  const supplied = createHash("sha256").update(parsed.data.password).digest();
  if (!timingSafeEqual(expected, supplied)) {
    const previous = failure && failure.until > now ? failure.count : 0;
    failedLogins.set(key, { count: previous + 1, until: now + WINDOW_MS });
    if (failedLogins.size > 1000) {
      for (const [address, attempt] of failedLogins) if (attempt.until < now) failedLogins.delete(address);
    }
    res.status(401).json({ error: "Incorrect password" });
    return;
  }
  failedLogins.delete(key);
  const expires = String(now + SESSION_LENGTH_MS);
  res.cookie(COOKIE, `${expires}.${sessionSignature(expires, secret)}`, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/api",
    maxAge: SESSION_LENGTH_MS,
  });
  res.json(LoginViewsAdminResponse.parse({ authenticated: true }));
});

router.post("/views/admin/logout", (req, res): void => {
  if (!sameOrigin(req)) {
    res.status(403).json({ error: "Invalid origin" });
    return;
  }
  res.clearCookie(COOKIE, { path: "/api", sameSite: "strict", secure: process.env.NODE_ENV === "production" });
  res.json(LogoutViewsAdminResponse.parse({ authenticated: false }));
});

router.get("/views/admin", async (req, res): Promise<void> => {
  if (!requireAdmin(req, res)) return;
  const [total, visits] = await Promise.all([
    viewCount(),
    db.select().from(viewsTable).orderBy(desc(viewsTable.visitedAt), desc(viewsTable.id)).limit(100),
  ]);
  res.json(GetViewsAdminResponse.parse({ count: total, visits: visits.map(serializeVisit) }));
});

router.get("/views.json", async (req, res): Promise<void> => {
  if (!requireAdmin(req, res)) return;
  const visits = await db.select().from(viewsTable).orderBy(desc(viewsTable.visitedAt), desc(viewsTable.id));
  res.setHeader("Content-Disposition", 'attachment; filename="views.json"');
  res.json(ExportViewsJsonResponse.parse({ count: visits.length, visits: visits.map(serializeVisit) }));
});

export default router;