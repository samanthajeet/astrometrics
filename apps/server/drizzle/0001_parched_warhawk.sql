CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch('subsec') * 1000) NOT NULL
);
--> statement-breakpoint
INSERT INTO `users` (`id`, `name`) VALUES ('local', 'Local user');
--> statement-breakpoint
CREATE TABLE `watchlist_items` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`kind` text NOT NULL,
	`tmdb_id` integer NOT NULL,
	`imdb_id` text,
	`title` text NOT NULL,
	`year` integer,
	`poster_path` text,
	`status` text DEFAULT 'want' NOT NULL,
	`added_at` integer DEFAULT (unixepoch('subsec') * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `watchlist_items_user_title_idx` ON `watchlist_items` (`user_id`,`kind`,`tmdb_id`);
--> statement-breakpoint
CREATE TABLE `__new_dashboards` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`name` text NOT NULL,
	`created_at` integer DEFAULT (unixepoch('subsec') * 1000) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_dashboards` (`id`, `user_id`, `name`, `created_at`)
	SELECT `id`, 'local', `name`, `created_at` FROM `dashboards`;
--> statement-breakpoint
DROP TABLE `dashboards`;
--> statement-breakpoint
ALTER TABLE `__new_dashboards` RENAME TO `dashboards`;
--> statement-breakpoint
CREATE INDEX `dashboards_user_idx` ON `dashboards` (`user_id`);
