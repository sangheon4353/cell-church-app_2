CREATE TABLE `bible_books` (
	`id` int AUTO_INCREMENT NOT NULL,
	`bookCode` varchar(10) NOT NULL,
	`bookName` varchar(50) NOT NULL,
	`bookNameEng` varchar(50) NOT NULL,
	`totalChapters` int NOT NULL,
	`testament` enum('old','new') NOT NULL,
	`order` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `bible_books_id` PRIMARY KEY(`id`),
	CONSTRAINT `bible_books_bookCode_unique` UNIQUE(`bookCode`)
);
--> statement-breakpoint
CREATE TABLE `bible_chapter_records` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`bookCode` varchar(10) NOT NULL,
	`bookName` varchar(50) NOT NULL,
	`chapterStart` int NOT NULL,
	`chapterEnd` int NOT NULL,
	`chapterCount` int NOT NULL,
	`recordDate` varchar(10) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `bible_chapter_records_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `weekly_stats` (
	`id` int AUTO_INCREMENT NOT NULL,
	`cellLeaderId` int NOT NULL,
	`weekStartDate` varchar(10) NOT NULL,
	`totalBibleChapters` int NOT NULL,
	`totalPrayerMinutes` int NOT NULL,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `weekly_stats_id` PRIMARY KEY(`id`)
);
