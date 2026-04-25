import {
  boolean,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * 셀 모임 사용자 프로필 (users 테이블 확장)
 */
export const cellProfiles = mysqlTable("cell_profiles", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  displayName: varchar("displayName", { length: 100 }).notNull(),
  gender: mysqlEnum("gender", ["male", "female"]).notNull(),
  birthDate: varchar("birthDate", { length: 10 }).notNull(), // YYYY-MM-DD
  phoneNumber: varchar("phoneNumber", { length: 20 }).notNull(),
  leaderId: int("leaderId"), // 셀 리더 userId (null이면 리더 본인)
  isLeader: boolean("isLeader").default(false).notNull(),
  approvalStatus: mysqlEnum("approvalStatus", ["pending", "approved", "rejected"])
    .default("pending")
    .notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type CellProfile = typeof cellProfiles.$inferSelect;
export type InsertCellProfile = typeof cellProfiles.$inferInsert;

/**
 * 성경 권 할당 (셀 리더가 셀원에게 할당)
 */
export const bibleAssignments = mysqlTable("bible_assignments", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  bookName: varchar("bookName", { length: 50 }).notNull(), // 예: 창세기, 마태복음
  bookCode: varchar("bookCode", { length: 10 }).notNull(), // 예: GEN, MAT
  totalChapters: int("totalChapters").notNull(),
  assignedBy: int("assignedBy").notNull(), // 셀 리더 userId
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type BibleAssignment = typeof bibleAssignments.$inferSelect;
export type InsertBibleAssignment = typeof bibleAssignments.$inferInsert;

/**
 * 성경 쓰기 기록 (절 단위)
 */
export const bibleRecords = mysqlTable("bible_records", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  bookCode: varchar("bookCode", { length: 10 }).notNull(),
  bookName: varchar("bookName", { length: 50 }).notNull(),
  chapter: int("chapter").notNull(),
  verseStart: int("verseStart").notNull(),
  verseEnd: int("verseEnd").notNull(),
  verseCount: int("verseCount").notNull(), // verseEnd - verseStart + 1
  recordDate: varchar("recordDate", { length: 10 }).notNull(), // YYYY-MM-DD
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type BibleRecord = typeof bibleRecords.$inferSelect;
export type InsertBibleRecord = typeof bibleRecords.$inferInsert;

/**
 * 기도 시간 기록
 */
export const prayerRecords = mysqlTable("prayer_records", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  minutes: int("minutes").notNull(),
  recordDate: varchar("recordDate", { length: 10 }).notNull(), // YYYY-MM-DD
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PrayerRecord = typeof prayerRecords.$inferSelect;
export type InsertPrayerRecord = typeof prayerRecords.$inferInsert;
