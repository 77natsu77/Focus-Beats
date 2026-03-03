import { db } from "./db";
import { focusSessions, type InsertFocusSession, type FocusSession } from "@shared/schema";

export interface IStorage {
  getSessions(): Promise<FocusSession[]>;
  createSession(session: InsertFocusSession): Promise<FocusSession>;
}

export class DatabaseStorage implements IStorage {
  async getSessions(): Promise<FocusSession[]> {
    return await db.select().from(focusSessions);
  }

  async createSession(session: InsertFocusSession): Promise<FocusSession> {
    const [newSession] = await db
      .insert(focusSessions)
      .values(session)
      .returning();
    return newSession;
  }
}

export const storage = new DatabaseStorage();
