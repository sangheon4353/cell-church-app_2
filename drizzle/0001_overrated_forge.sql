CREATE TABLE `bible_assignments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`bookName` varchar(50) NOT NULL,
	`bookCode` varchar(10) NOT NULL,
	`totalChapters` int NOT NULL,
	`assignedBy` int NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `bible_assignments_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `bible_records` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`bookCode` varchar(10) NOT NULL,
	`bookName` varchar(50) NOT NULL,
	`chapter` int NOT NULL,
	`verseStart` int NOT NULL,
	`verseEnd` int NOT NULL,
	`verseCount` int NOT NULL,
	`recordDate` date NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `bible_records_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cell_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`displayName` varchar(100) NOT NULL,
	`gender` enum('male','female') NOT NULL,
	`birthDate` varchar(10) NOT NULL,
	`phoneNumber` varchar(20) NOT NULL,
	`leaderId` int,
	`isLeader` boolean NOT NULL DEFAULT false,
	`approvalStatus` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cell_profiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `prayer_records` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`minutes` int NOT NULL,
	`recordDate` date NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `prayer_records_id` PRIMARY KEY(`id`)
);
