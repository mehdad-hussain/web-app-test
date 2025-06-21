ALTER TABLE `users` MODIFY COLUMN `emailVerified` boolean NOT NULL;--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `emailVerified` boolean NOT NULL DEFAULT false;