# Brimas Media / Print Garage

A printing and branding website with product pricing, WhatsApp quote requests, and a private visit-history page.

## Run & Operate

- Use Replit's Run button to start the managed site and API workflows.
- `artifacts/brimas-media: web` — React/Vite website at `/`, port 20947.
- `artifacts/api-server: API Server` — Express API at `/api`, port 8080.
- Workflows supply the required `PORT` and frontend `BASE_PATH` settings.
- `pnpm install --frozen-lockfile` — install the existing workspace dependencies.
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required secrets: `DATABASE_URL` (provided by Replit) and `SESSION_SECRET`.
- `BRIMAS_VIEWS_PASSWORD` is required to sign in at `/admin/views`; without it, admin login explicitly returns 503. Never commit passwords.
- Public API checks: `/api/healthz` and `/api/views`.
- `pnpm --filter @workspace/brimas-media test:images` — image delivery tests (requires Node.js 24).

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/brimas-media` — website, routes, images, and frontend tests.
- `artifacts/api-server` — API and protected visit-history endpoints.
- `lib/db/src/schema` — Drizzle database schema.
- `lib/api-spec/openapi.yaml` — API contract.
- `docs/netlify.md` — optional Netlify hosting instructions; not needed for Replit preview.
- `artifacts/mockup-sandbox` — imported design sandbox, not required to run the website.

## Architecture decisions

_Populate as you build — non-obvious choices a reader couldn't infer from the code (3-5 bullets)._

## Product

_Describe the high-level user-facing capabilities of this app once they exist._

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

_Populate as you build — sharp edges, "always run X before Y" rules._

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
