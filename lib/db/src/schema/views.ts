import { pgTable, serial, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const viewsTable = pgTable("homepage_views", {
  id: serial("id").primaryKey(),
  ip: varchar("ip", { length: 45 }).notNull(),
  userAgent: text("user_agent").notNull(),
  visitedAt: timestamp("visited_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertViewSchema = createInsertSchema(viewsTable).omit({ id: true, visitedAt: true });
export type InsertView = z.infer<typeof insertViewSchema>;
export type View = typeof viewsTable.$inferSelect;