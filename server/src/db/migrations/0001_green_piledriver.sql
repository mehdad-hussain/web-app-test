CREATE TABLE `follows` (
	`followerId` varchar(255) NOT NULL,
	`followingId` varchar(255) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `follows_followerId_followingId_pk` PRIMARY KEY(`followerId`,`followingId`)
);
--> statement-breakpoint
CREATE TABLE `likes` (
	`murmurId` varchar(255) NOT NULL,
	`userId` varchar(255) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `likes_murmurId_userId_pk` PRIMARY KEY(`murmurId`,`userId`)
);
--> statement-breakpoint
CREATE TABLE `murmurs` (
	`id` varchar(255) NOT NULL,
	`content` varchar(280) NOT NULL,
	`authorId` varchar(255) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	`likeCount` int NOT NULL DEFAULT 0,
	CONSTRAINT `murmurs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `sessions` ADD `deviceInfo` varchar(255);--> statement-breakpoint
ALTER TABLE `sessions` ADD `ipAddress` varchar(45);--> statement-breakpoint
ALTER TABLE `sessions` ADD `lastUsed` timestamp DEFAULT (now()) NOT NULL;--> statement-breakpoint
ALTER TABLE `sessions` ADD `isActive` boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `createdAt` timestamp DEFAULT (now()) NOT NULL;--> statement-breakpoint
ALTER TABLE `users` ADD `updatedAt` timestamp DEFAULT (now()) NOT NULL;--> statement-breakpoint
ALTER TABLE `follows` ADD CONSTRAINT `follows_followerId_users_id_fk` FOREIGN KEY (`followerId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `follows` ADD CONSTRAINT `follows_followingId_users_id_fk` FOREIGN KEY (`followingId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `likes` ADD CONSTRAINT `likes_murmurId_murmurs_id_fk` FOREIGN KEY (`murmurId`) REFERENCES `murmurs`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `likes` ADD CONSTRAINT `likes_userId_users_id_fk` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `murmurs` ADD CONSTRAINT `murmurs_authorId_users_id_fk` FOREIGN KEY (`authorId`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;