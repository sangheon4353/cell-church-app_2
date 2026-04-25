import { and, desc, eq, gte, lte, sql, sum } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  bibleAssignments,
  bibleBooks,
  bibleChapterRecords,
  bibleRecords,
  cellProfiles,
  prayerRecords,
  users,
  weeklyStats,
  type BibleAssignment,
  type BibleBook,
  type BibleChapterRecord,
  type BibleRecord,
  type CellProfile,
  type InsertBibleAssignment,
  type InsertBibleChapterRecord,
  type InsertBibleRecord,
  type InsertCellProfile,
  type InsertPrayerRecord,
  type InsertUser,
  type WeeklyStat,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ─── Core User ─────────────────────────────────────────────────────────────────

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot upsert user: database not available"); return; }

  const values: InsertUser = { openId: user.openId };
  const updateSet: Record<string, unknown> = {};
  const textFields = ["name", "email", "loginMethod"] as const;
  type TextField = (typeof textFields)[number];
  const assignNullable = (field: TextField) => {
    const value = user[field];
    if (value === undefined) return;
    const normalized = value ?? null;
    values[field] = normalized;
    updateSet[field] = normalized;
  };
  textFields.forEach(assignNullable);
  if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
  if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
  else if (user.openId === ENV.ownerOpenId) { values.role = "admin"; updateSet.role = "admin"; }
  if (!values.lastSignedIn) values.lastSignedIn = new Date();
  if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();

  await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ─── Cell Profile ──────────────────────────────────────────────────────────────

export async function getCellProfileByUserId(userId: number): Promise<CellProfile | null> {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(cellProfiles).where(eq(cellProfiles.userId, userId));
  return rows[0] ?? null;
}

export async function createCellProfile(data: InsertCellProfile): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(cellProfiles).values(data);
  return result[0].insertId;
}

export async function updateCellProfile(userId: number, data: Partial<InsertCellProfile>): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(cellProfiles).set(data).where(eq(cellProfiles.userId, userId));
}

export async function getLeaders(): Promise<{ userId: number; displayName: string; phoneNumber: string }[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select({ userId: cellProfiles.userId, displayName: cellProfiles.displayName, phoneNumber: cellProfiles.phoneNumber })
    .from(cellProfiles).where(eq(cellProfiles.isLeader, true));
}

export async function getCellMembers(leaderId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    id: cellProfiles.id, userId: cellProfiles.userId, displayName: cellProfiles.displayName,
    gender: cellProfiles.gender, birthDate: cellProfiles.birthDate, phoneNumber: cellProfiles.phoneNumber,
    leaderId: cellProfiles.leaderId, isLeader: cellProfiles.isLeader, approvalStatus: cellProfiles.approvalStatus,
    createdAt: cellProfiles.createdAt, updatedAt: cellProfiles.updatedAt, userName: users.name,
  }).from(cellProfiles).leftJoin(users, eq(cellProfiles.userId, users.id))
    .where(eq(cellProfiles.leaderId, leaderId));
}

export async function getPendingMembers(leaderId: number): Promise<(CellProfile & { userName: string | null })[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    id: cellProfiles.id, userId: cellProfiles.userId, displayName: cellProfiles.displayName,
    gender: cellProfiles.gender, birthDate: cellProfiles.birthDate, phoneNumber: cellProfiles.phoneNumber,
    leaderId: cellProfiles.leaderId, isLeader: cellProfiles.isLeader, approvalStatus: cellProfiles.approvalStatus,
    createdAt: cellProfiles.createdAt, updatedAt: cellProfiles.updatedAt, userName: users.name,
  }).from(cellProfiles).leftJoin(users, eq(cellProfiles.userId, users.id))
    .where(and(eq(cellProfiles.leaderId, leaderId), eq(cellProfiles.approvalStatus, "pending")));
}

export async function approveOrRejectMember(targetUserId: number, status: "approved" | "rejected"): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(cellProfiles).set({ approvalStatus: status }).where(eq(cellProfiles.userId, targetUserId));
}

// ─── Bible Assignment ──────────────────────────────────────────────────────────

export async function getBibleAssignmentByUserId(userId: number): Promise<BibleAssignment | null> {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(bibleAssignments).where(eq(bibleAssignments.userId, userId));
  return rows[0] ?? null;
}

export async function upsertBibleAssignment(data: InsertBibleAssignment): Promise<void> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await getBibleAssignmentByUserId(data.userId);
  if (existing) {
    await db.update(bibleAssignments).set({ bookName: data.bookName, bookCode: data.bookCode, totalChapters: data.totalChapters, assignedBy: data.assignedBy })
      .where(eq(bibleAssignments.userId, data.userId));
  } else {
    await db.insert(bibleAssignments).values(data);
  }
}

export async function getCellBibleAssignments(leaderId: number): Promise<(BibleAssignment & { displayName: string })[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select({
    id: bibleAssignments.id, userId: bibleAssignments.userId, bookName: bibleAssignments.bookName,
    bookCode: bibleAssignments.bookCode, totalChapters: bibleAssignments.totalChapters,
    assignedBy: bibleAssignments.assignedBy, createdAt: bibleAssignments.createdAt,
    updatedAt: bibleAssignments.updatedAt, displayName: cellProfiles.displayName,
  }).from(bibleAssignments).innerJoin(cellProfiles, eq(bibleAssignments.userId, cellProfiles.userId))
    .where(eq(cellProfiles.leaderId, leaderId));
}

// ─── Bible Records ─────────────────────────────────────────────────────────────

export async function addBibleRecord(data: InsertBibleRecord): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(bibleRecords).values(data);
  return result[0].insertId;
}

export async function getUserBibleRecords(userId: number): Promise<BibleRecord[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(bibleRecords).where(eq(bibleRecords.userId, userId)).orderBy(desc(bibleRecords.recordDate));
}

export async function getUserBibleRecordsByBook(userId: number, bookCode: string): Promise<BibleRecord[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(bibleRecords).where(and(eq(bibleRecords.userId, userId), eq(bibleRecords.bookCode, bookCode)));
}

export async function getCellWeeklyTotalVerses(leaderId: number, weekStart: string, weekEnd: string): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  const members = await getCellMembers(leaderId);
  const approvedIds = members.filter((m) => m.approvalStatus === "approved").map((m) => m.userId);
  if (approvedIds.length === 0) return 0;
  let total = 0;
  for (const uid of approvedIds) {
    const rows = await db.select({ s: sum(bibleRecords.verseCount) }).from(bibleRecords)
      .where(and(eq(bibleRecords.userId, uid), gte(bibleRecords.recordDate, weekStart), lte(bibleRecords.recordDate, weekEnd)));
    total += Number(rows[0]?.s ?? 0);
  }
  return total;
}

export async function getCellMembersWithProgress(leaderId: number) {
  const db = await getDb();
  if (!db) return [];
  const members = await getCellMembers(leaderId);
  const approvedMembers = members.filter((m) => m.approvalStatus === "approved");
  const results = [];
  for (const member of approvedMembers) {
    const assignment = await getBibleAssignmentByUserId(member.userId);
    let completedChapters = 0;
    let totalVerses = 0;
    if (assignment) {
      const records = await db.select({
        maxChapter: sql<number>`COALESCE(MAX(${bibleRecords.chapter}), 0)`,
        totalVerses: sql<number>`COALESCE(SUM(${bibleRecords.verseCount}), 0)`,
      }).from(bibleRecords).where(and(eq(bibleRecords.userId, member.userId), eq(bibleRecords.bookCode, assignment.bookCode)));
      completedChapters = records[0]?.maxChapter ?? 0;
      totalVerses = records[0]?.totalVerses ?? 0;
    }
    results.push({ userId: member.userId, displayName: member.displayName, assignment, completedChapters, totalVerses });
  }
  return results;
}

// ─── Prayer Records ────────────────────────────────────────────────────────────

export async function addPrayerRecord(data: InsertPrayerRecord): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(prayerRecords).values(data);
  return result[0].insertId;
}

export async function getUserWeeklyPrayerMinutes(userId: number, weekStart: string, weekEnd: string): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  const rows = await db.select({ s: sum(prayerRecords.minutes) }).from(prayerRecords)
    .where(and(eq(prayerRecords.userId, userId), gte(prayerRecords.recordDate, weekStart), lte(prayerRecords.recordDate, weekEnd)));
  return Number(rows[0]?.s ?? 0);
}

export async function getCellWeeklyPrayerMinutes(leaderId: number, weekStart: string, weekEnd: string): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  const members = await getCellMembers(leaderId);
  const approvedIds = members.filter((m) => m.approvalStatus === "approved").map((m) => m.userId);
  if (approvedIds.length === 0) return 0;
  let total = 0;
  for (const uid of approvedIds) {
    const rows = await db.select({ s: sum(prayerRecords.minutes) }).from(prayerRecords)
      .where(and(eq(prayerRecords.userId, uid), gte(prayerRecords.recordDate, weekStart), lte(prayerRecords.recordDate, weekEnd)));
    total += Number(rows[0]?.s ?? 0);
  }
  return total;
}

// ─── Bible Books (Master Data) ─────────────────────────────────────────────────

export async function getAllBibleBooks(): Promise<BibleBook[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(bibleBooks).orderBy(bibleBooks.order);
}

export async function getBibleBookByCode(bookCode: string): Promise<BibleBook | null> {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(bibleBooks).where(eq(bibleBooks.bookCode, bookCode));
  return rows[0] ?? null;
}

// ─── Bible Chapter Records (새로운 장 기반 기록) ────────────────────────────────

export async function addBibleChapterRecord(data: InsertBibleChapterRecord): Promise<number> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(bibleChapterRecords).values(data);
  return result[0].insertId;
}

export async function getUserBibleChapterRecords(userId: number): Promise<BibleChapterRecord[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(bibleChapterRecords).where(eq(bibleChapterRecords.userId, userId))
    .orderBy(desc(bibleChapterRecords.recordDate));
}

export async function getUserBibleChapterRecordsByBook(userId: number, bookCode: string): Promise<BibleChapterRecord[]> {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(bibleChapterRecords)
    .where(and(eq(bibleChapterRecords.userId, userId), eq(bibleChapterRecords.bookCode, bookCode)))
    .orderBy(desc(bibleChapterRecords.recordDate));
}

export async function getCellWeeklyTotalChapters(leaderId: number, weekStart: string, weekEnd: string): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  const members = await getCellMembers(leaderId);
  const approvedIds = members.filter((m) => m.approvalStatus === "approved").map((m) => m.userId);
  if (approvedIds.length === 0) return 0;
  let total = 0;
  for (const uid of approvedIds) {
    const rows = await db.select({ s: sum(bibleChapterRecords.chapterCount) }).from(bibleChapterRecords)
      .where(and(eq(bibleChapterRecords.userId, uid), gte(bibleChapterRecords.recordDate, weekStart), lte(bibleChapterRecords.recordDate, weekEnd)));
    total += Number(rows[0]?.s ?? 0);
  }
  return total;
}

export async function getCellMembersWithChapterProgress(leaderId: number) {
  const db = await getDb();
  if (!db) return [];
  const members = await getCellMembers(leaderId);
  const approvedMembers = members.filter((m) => m.approvalStatus === "approved");
  const results = [];
  for (const member of approvedMembers) {
    const assignment = await getBibleAssignmentByUserId(member.userId);
    let completedChapters = 0;
    if (assignment) {
      const records = await db.select({
        totalChapters: sql<number>`COALESCE(SUM(${bibleChapterRecords.chapterCount}), 0)`,
      }).from(bibleChapterRecords).where(and(eq(bibleChapterRecords.userId, member.userId), eq(bibleChapterRecords.bookCode, assignment.bookCode)));
      completedChapters = records[0]?.totalChapters ?? 0;
    }
    results.push({ userId: member.userId, displayName: member.displayName, assignment, completedChapters });
  }
  return results;
}

// ─── Weekly Stats (캐시) ────────────────────────────────────────────────────────

export async function getOrCreateWeeklyStat(cellLeaderId: number, weekStartDate: string): Promise<WeeklyStat> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const rows = await db.select().from(weeklyStats)
    .where(and(eq(weeklyStats.cellLeaderId, cellLeaderId), eq(weeklyStats.weekStartDate, weekStartDate)));
  if (rows.length > 0) return rows[0];
  
  // 새로운 주간 통계 생성
  const weekEnd = new Date(weekStartDate);
  weekEnd.setDate(weekEnd.getDate() + 6);
  const weekEndStr = weekEnd.toISOString().split('T')[0];
  
  const totalChapters = await getCellWeeklyTotalChapters(cellLeaderId, weekStartDate, weekEndStr);
  const totalMinutes = await getCellWeeklyPrayerMinutes(cellLeaderId, weekStartDate, weekEndStr);
  
  const result = await db.insert(weeklyStats).values({
    cellLeaderId,
    weekStartDate,
    totalBibleChapters: totalChapters,
    totalPrayerMinutes: totalMinutes,
  });
  
  return {
    id: result[0].insertId,
    cellLeaderId,
    weekStartDate,
    totalBibleChapters: totalChapters,
    totalPrayerMinutes: totalMinutes,
    updatedAt: new Date(),
  };
}

// ─── TOP 3 Rankings ────────────────────────────────────────────────────────
export async function getCellBibleTop3(cellLeaderId: number, weekStartDate: string): Promise<Array<{ displayName: string; chapters: number }>> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const weekEnd = new Date(weekStartDate);
  weekEnd.setDate(weekEnd.getDate() + 6);
  const weekEndStr = weekEnd.toISOString().split('T')[0];
  
  const members = await getCellMembers(cellLeaderId);
  const approvedMembers = members.filter((m) => m.approvalStatus === "approved");
  
  const results = [];
  for (const member of approvedMembers) {
    const records = await db.select({
      totalChapters: sql<number>`COALESCE(SUM(${bibleChapterRecords.chapterCount}), 0)`,
    }).from(bibleChapterRecords).where(and(
      eq(bibleChapterRecords.userId, member.userId),
      gte(bibleChapterRecords.recordDate, weekStartDate),
      lte(bibleChapterRecords.recordDate, weekEndStr)
    ));
    
    const chapters = records[0]?.totalChapters ?? 0;
    if (chapters > 0) {
      results.push({ displayName: member.displayName, chapters });
    }
  }
  
  return results.sort((a, b) => b.chapters - a.chapters).slice(0, 3);
}

export async function getCellPrayerTop3(cellLeaderId: number, weekStartDate: string): Promise<Array<{ displayName: string; minutes: number }>> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const weekEnd = new Date(weekStartDate);
  weekEnd.setDate(weekEnd.getDate() + 6);
  const weekEndStr = weekEnd.toISOString().split('T')[0];
  
  const members = await getCellMembers(cellLeaderId);
  const approvedMembers = members.filter((m) => m.approvalStatus === "approved");
  
  const results = [];
  for (const member of approvedMembers) {
    const records = await db.select({
      totalMinutes: sql<number>`COALESCE(SUM(${prayerRecords.minutes}), 0)`,
    }).from(prayerRecords).where(and(
      eq(prayerRecords.userId, member.userId),
      gte(prayerRecords.recordDate, weekStartDate),
      lte(prayerRecords.recordDate, weekEndStr)
    ));
    
    const minutes = records[0]?.totalMinutes ?? 0;
    if (minutes > 0) {
      results.push({ displayName: member.displayName, minutes });
    }
  }
  
  return results.sort((a, b) => b.minutes - a.minutes).slice(0, 3);
}
