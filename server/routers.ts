import { z } from "zod";
import { COOKIE_NAME } from "../shared/const.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import * as db from "./db";

// 성경 66권 목록
const BIBLE_BOOKS = [
  { code: "GEN", name: "창세기", chapters: 50 },
  { code: "EXO", name: "출애굽기", chapters: 40 },
  { code: "LEV", name: "레위기", chapters: 27 },
  { code: "NUM", name: "민수기", chapters: 36 },
  { code: "DEU", name: "신명기", chapters: 34 },
  { code: "JOS", name: "여호수아", chapters: 24 },
  { code: "JDG", name: "사사기", chapters: 21 },
  { code: "RUT", name: "룻기", chapters: 4 },
  { code: "1SA", name: "사무엘상", chapters: 31 },
  { code: "2SA", name: "사무엘하", chapters: 24 },
  { code: "1KI", name: "열왕기상", chapters: 22 },
  { code: "2KI", name: "열왕기하", chapters: 25 },
  { code: "1CH", name: "역대상", chapters: 29 },
  { code: "2CH", name: "역대하", chapters: 36 },
  { code: "EZR", name: "에스라", chapters: 10 },
  { code: "NEH", name: "느헤미야", chapters: 13 },
  { code: "EST", name: "에스더", chapters: 10 },
  { code: "JOB", name: "욥기", chapters: 42 },
  { code: "PSA", name: "시편", chapters: 150 },
  { code: "PRO", name: "잠언", chapters: 31 },
  { code: "ECC", name: "전도서", chapters: 12 },
  { code: "SNG", name: "아가", chapters: 8 },
  { code: "ISA", name: "이사야", chapters: 66 },
  { code: "JER", name: "예레미야", chapters: 52 },
  { code: "LAM", name: "예레미야애가", chapters: 5 },
  { code: "EZK", name: "에스겔", chapters: 48 },
  { code: "DAN", name: "다니엘", chapters: 12 },
  { code: "HOS", name: "호세아", chapters: 14 },
  { code: "JOL", name: "요엘", chapters: 3 },
  { code: "AMO", name: "아모스", chapters: 9 },
  { code: "OBA", name: "오바댜", chapters: 1 },
  { code: "JON", name: "요나", chapters: 4 },
  { code: "MIC", name: "미가", chapters: 7 },
  { code: "NAM", name: "나훔", chapters: 3 },
  { code: "HAB", name: "하박국", chapters: 3 },
  { code: "ZEP", name: "스바냐", chapters: 3 },
  { code: "HAG", name: "학개", chapters: 2 },
  { code: "ZEC", name: "스가랴", chapters: 14 },
  { code: "MAL", name: "말라기", chapters: 4 },
  { code: "MAT", name: "마태복음", chapters: 28 },
  { code: "MRK", name: "마가복음", chapters: 16 },
  { code: "LUK", name: "누가복음", chapters: 24 },
  { code: "JHN", name: "요한복음", chapters: 21 },
  { code: "ACT", name: "사도행전", chapters: 28 },
  { code: "ROM", name: "로마서", chapters: 16 },
  { code: "1CO", name: "고린도전서", chapters: 16 },
  { code: "2CO", name: "고린도후서", chapters: 13 },
  { code: "GAL", name: "갈라디아서", chapters: 6 },
  { code: "EPH", name: "에베소서", chapters: 6 },
  { code: "PHP", name: "빌립보서", chapters: 4 },
  { code: "COL", name: "골로새서", chapters: 4 },
  { code: "1TH", name: "데살로니가전서", chapters: 5 },
  { code: "2TH", name: "데살로니가후서", chapters: 3 },
  { code: "1TI", name: "디모데전서", chapters: 6 },
  { code: "2TI", name: "디모데후서", chapters: 4 },
  { code: "TIT", name: "디도서", chapters: 3 },
  { code: "PHM", name: "빌레몬서", chapters: 1 },
  { code: "HEB", name: "히브리서", chapters: 13 },
  { code: "JAS", name: "야고보서", chapters: 5 },
  { code: "1PE", name: "베드로전서", chapters: 5 },
  { code: "2PE", name: "베드로후서", chapters: 3 },
  { code: "1JN", name: "요한일서", chapters: 5 },
  { code: "2JN", name: "요한이서", chapters: 1 },
  { code: "3JN", name: "요한삼서", chapters: 1 },
  { code: "JUD", name: "유다서", chapters: 1 },
  { code: "REV", name: "요한계시록", chapters: 22 },
];

function getWeekRange(): { weekStart: string; weekEnd: string } {
  const now = new Date();
  const day = now.getDay();
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(now);
  monday.setDate(now.getDate() + diffToMonday);
  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  const fmt = (d: Date) => d.toISOString().split("T")[0];
  return { weekStart: fmt(monday), weekEnd: fmt(sunday) };
}

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  health: publicProcedure.query(() => ({ status: "ok" })),
  bibleBooks: publicProcedure.query(() => BIBLE_BOOKS),

  // ─── Bible Chapter Records (새로운 장 기반 기록) ──────────────────────────────
  bibleChapterRecord: router({
    listByBook: protectedProcedure
      .input(z.object({ bookCode: z.string() }))
      .query(async ({ ctx, input }) => {
        return db.getUserBibleChapterRecordsByBook(ctx.user.id, input.bookCode);
      }),
    add: protectedProcedure
      .input(z.object({
        bookCode: z.string(),
        bookName: z.string().optional(),
        chapterStart: z.number().min(1),
        chapterEnd: z.number().min(1),
        recordDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      }))
      .mutation(async ({ ctx, input }) => {
        const chapterCount = input.chapterEnd - input.chapterStart + 1;
        const book = BIBLE_BOOKS.find(b => b.code === input.bookCode);
        return db.addBibleChapterRecord({
          userId: ctx.user.id,
          bookCode: input.bookCode,
          bookName: book?.name ?? input.bookCode,
          chapterStart: input.chapterStart,
          chapterEnd: input.chapterEnd,
          chapterCount,
          recordDate: input.recordDate,
        });
      }),
  }),

  // ─── Cell Profile ─────────────────────────────────────────────────────────────
  profile: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      return db.getCellProfileByUserId(ctx.user.id);
    }),

    create: protectedProcedure
      .input(z.object({
        displayName: z.string().min(1).max(100),
        gender: z.enum(["male", "female"]),
        birthDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
        phoneNumber: z.string().min(10).max(20),
        leaderId: z.number().optional(),
        isLeader: z.boolean().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const existing = await db.getCellProfileByUserId(ctx.user.id);
        if (existing) {
          await db.updateCellProfile(ctx.user.id, {
            displayName: input.displayName,
            gender: input.gender,
            birthDate: input.birthDate,
            phoneNumber: input.phoneNumber,
            leaderId: input.leaderId ?? null,
            isLeader: input.isLeader ?? false,
            approvalStatus: input.isLeader ? "approved" : "pending",
          });
          return existing.id;
        }
        return db.createCellProfile({
          userId: ctx.user.id,
          displayName: input.displayName,
          gender: input.gender,
          birthDate: input.birthDate,
          phoneNumber: input.phoneNumber,
          leaderId: input.leaderId ?? null,
          isLeader: input.isLeader ?? false,
          approvalStatus: input.isLeader ? "approved" : "pending",
        });
      }),
  }),

  // ─── Leaders ──────────────────────────────────────────────────────────────────
  leaders: router({
    list: publicProcedure.query(() => db.getLeaders()),
  }),

  // ─── Cell Management (Leader) ─────────────────────────────────────────────────
  cell: router({
    members: protectedProcedure.query(async ({ ctx }) => {
      return db.getCellMembers(ctx.user.id);
    }),

    pendingMembers: protectedProcedure.query(async ({ ctx }) => {
      return db.getPendingMembers(ctx.user.id);
    }),

    approve: protectedProcedure
      .input(z.object({ targetUserId: z.number(), status: z.enum(["approved", "rejected"]) }))
      .mutation(async ({ input }) => {
        await db.approveOrRejectMember(input.targetUserId, input.status);
      }),

    weeklyStats: protectedProcedure.query(async ({ ctx }) => {
      const { weekStart, weekEnd } = getWeekRange();
      const profile = await db.getCellProfileByUserId(ctx.user.id);
      const leaderId = profile?.isLeader ? ctx.user.id : (profile?.leaderId ?? ctx.user.id);
      const [totalVerses, totalPrayer, membersProgress] = await Promise.all([
        db.getCellWeeklyTotalVerses(leaderId, weekStart, weekEnd),
        db.getCellWeeklyPrayerMinutes(leaderId, weekStart, weekEnd),
        db.getCellMembersWithProgress(leaderId),
      ]);
      return { totalVerses, totalPrayer, membersProgress, weekStart, weekEnd };
    }),
  }),

  // ─── Bible Assignment ─────────────────────────────────────────────────────────
  bibleAssignment: router({
    get: protectedProcedure.query(async ({ ctx }) => {
      return db.getBibleAssignmentByUserId(ctx.user.id);
    }),

    assign: protectedProcedure
      .input(z.object({
        targetUserId: z.number(),
        bookCode: z.string(),
        bookName: z.string(),
        totalChapters: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        await db.upsertBibleAssignment({
          userId: input.targetUserId,
          bookCode: input.bookCode,
          bookName: input.bookName,
          totalChapters: input.totalChapters,
          assignedBy: ctx.user.id,
        });
      }),

    cellList: protectedProcedure.query(async ({ ctx }) => {
      return db.getCellBibleAssignments(ctx.user.id);
    }),
  }),

  // ─── Bible Records ────────────────────────────────────────────────────────────
  bibleRecord: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserBibleRecords(ctx.user.id);
    }),

    listByBook: protectedProcedure
      .input(z.object({ bookCode: z.string() }))
      .query(async ({ ctx, input }) => {
        return db.getUserBibleRecordsByBook(ctx.user.id, input.bookCode);
      }),

    add: protectedProcedure
      .input(z.object({
        bookCode: z.string(),
        bookName: z.string(),
        chapter: z.number().min(1),
        verseStart: z.number().min(1),
        verseEnd: z.number().min(1),
        recordDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      }))
      .mutation(async ({ ctx, input }) => {
        const verseCount = input.verseEnd - input.verseStart + 1;
        if (verseCount <= 0) throw new Error("verseEnd must be >= verseStart");
        return db.addBibleRecord({
          userId: ctx.user.id,
          bookCode: input.bookCode,
          bookName: input.bookName,
          chapter: input.chapter,
          verseStart: input.verseStart,
          verseEnd: input.verseEnd,
          verseCount,
          recordDate: input.recordDate,
        });
      }),

    weeklyTotal: protectedProcedure.query(async ({ ctx }) => {
      const { weekStart, weekEnd } = getWeekRange();
      const profile = await db.getCellProfileByUserId(ctx.user.id);
      const leaderId = profile?.isLeader ? ctx.user.id : (profile?.leaderId ?? ctx.user.id);
      const total = await db.getCellWeeklyTotalVerses(leaderId, weekStart, weekEnd);
      return { total, weekStart, weekEnd };
    }),
  }),

  // ─── Prayer Records ───────────────────────────────────────────────────────────
  prayerRecord: router({
    addMinutes: protectedProcedure
      .input(z.object({
        minutes: z.number().min(1).max(1440),
        recordDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      }))
      .mutation(async ({ ctx, input }) => {
        return db.addPrayerRecord({ userId: ctx.user.id, minutes: input.minutes, recordDate: input.recordDate });
      }),

    // add is an alias for addMinutes
    add: protectedProcedure
      .input(z.object({
        minutes: z.number().min(1).max(480),
        recordDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      }))
      .mutation(async ({ ctx, input }) => {
        return db.addPrayerRecord({ userId: ctx.user.id, minutes: input.minutes, recordDate: input.recordDate });
      }),

    todayMinutes: protectedProcedure.query(async ({ ctx }) => {
      const today = new Date();
      const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
      const minutes = await db.getUserWeeklyPrayerMinutes(ctx.user.id, todayStr, todayStr);
      return { minutes };
    }),

    weeklyStats: protectedProcedure.query(async ({ ctx }) => {
      const { weekStart, weekEnd } = getWeekRange();
      const profile = await db.getCellProfileByUserId(ctx.user.id);
      const leaderId = profile?.isLeader ? ctx.user.id : (profile?.leaderId ?? ctx.user.id);
      const [myMinutes, cellMinutes] = await Promise.all([
        db.getUserWeeklyPrayerMinutes(ctx.user.id, weekStart, weekEnd),
        db.getCellWeeklyPrayerMinutes(leaderId, weekStart, weekEnd),
      ]);
      return { myMinutes, cellMinutes, weekStart, weekEnd };
    }),
  }),
  // ─── TOP 3 Rankings ────────────────────────────────────────────────────────
  rankings: router({
    bibleTop3: protectedProcedure.query(async ({ ctx }) => {
      const { weekStart } = getWeekRange();
      const profile = await db.getCellProfileByUserId(ctx.user.id);
      const leaderId = profile?.isLeader ? ctx.user.id : (profile?.leaderId ?? ctx.user.id);
      return db.getCellBibleTop3(leaderId, weekStart);
    }),
    prayerTop3: protectedProcedure.query(async ({ ctx }) => {
      const { weekStart } = getWeekRange();
      const profile = await db.getCellProfileByUserId(ctx.user.id);
      const leaderId = profile?.isLeader ? ctx.user.id : (profile?.leaderId ?? ctx.user.id);
      return db.getCellPrayerTop3(leaderId, weekStart);
    }),
  }),
});

export type AppRouter = typeof appRouter;
