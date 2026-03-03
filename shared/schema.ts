import { pgTable, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const focusSessions = pgTable("focus_sessions", {
  id: serial("id").primaryKey(),
  durationMinutes: integer("duration_minutes").notNull(),
  completedAt: timestamp("completed_at").defaultNow(),
});

export const insertFocusSessionSchema = createInsertSchema(focusSessions).omit({ id: true, completedAt: true });

export type FocusSession = typeof focusSessions.$inferSelect;
export type InsertFocusSession = z.infer<typeof insertFocusSessionSchema>;
