ALTER TABLE `users` ADD `hashedPassword` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `hashedRefreshToken` varchar(255);