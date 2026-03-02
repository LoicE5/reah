CREATE TABLE `comments` (
	`comment_id` int AUTO_INCREMENT NOT NULL,
	`comment_content` text NOT NULL,
	`comment_video_id` int,
	`comment_user_id` int,
	`comment_date` datetime DEFAULT CURRENT_TIMESTAMP,
	`comment_report_id` text,
	CONSTRAINT `comments_comment_id` PRIMARY KEY(`comment_id`)
);
--> statement-breakpoint
CREATE TABLE `defis` (
	`defi_id` int AUTO_INCREMENT NOT NULL,
	`defi_name` varchar(255) NOT NULL,
	`defi_description` text,
	`defi_timestamp` datetime DEFAULT CURRENT_TIMESTAMP,
	`defi_image` varchar(255),
	`defi_user_id` int,
	`defi_verified` tinyint DEFAULT 0,
	`defi_current` tinyint DEFAULT 0,
	`defi_date_end` varchar(50),
	CONSTRAINT `defis_defi_id` PRIMARY KEY(`defi_id`)
);
--> statement-breakpoint
CREATE TABLE `distribution` (
	`distribution_user_id` int,
	`distribution_video_id` int
);
--> statement-breakpoint
CREATE TABLE `liked` (
	`liked_user_id` int NOT NULL,
	`liked_video_id` int NOT NULL,
	CONSTRAINT `liked_liked_user_id_liked_video_id_pk` PRIMARY KEY(`liked_user_id`,`liked_video_id`)
);
--> statement-breakpoint
CREATE TABLE `password_reset_tokens` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`token_hash` varchar(64) NOT NULL,
	`expires_at` datetime NOT NULL,
	`used_at` datetime,
	`created_at` datetime DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT `password_reset_tokens_id` PRIMARY KEY(`id`),
	CONSTRAINT `password_reset_tokens_token_hash_unique` UNIQUE(`token_hash`)
);
--> statement-breakpoint
CREATE TABLE `saved` (
	`saved_user_id` int NOT NULL,
	`saved_video_id` int NOT NULL,
	CONSTRAINT `saved_saved_user_id_saved_video_id_pk` PRIMARY KEY(`saved_user_id`,`saved_video_id`)
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`sessions_userid` int NOT NULL,
	`sessions_token` varchar(64) NOT NULL,
	`sessions_serial` varchar(64) NOT NULL,
	`sessions_date` datetime DEFAULT CURRENT_TIMESTAMP
);
--> statement-breakpoint
CREATE TABLE `subscription` (
	`subscription_id` int AUTO_INCREMENT NOT NULL,
	`subscription_subscriber_id` int,
	`subscription_artist_id` int,
	CONSTRAINT `subscription_subscription_id` PRIMARY KEY(`subscription_id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`user_id` int AUTO_INCREMENT NOT NULL,
	`user_username` varchar(50) NOT NULL,
	`user_email` varchar(255) NOT NULL,
	`user_password` varchar(255) NOT NULL,
	`user_lastname` varchar(100),
	`user_firstname` varchar(100),
	`user_birthday` varchar(20),
	`user_status` tinyint DEFAULT 0,
	`user_CGU` tinyint DEFAULT 0,
	`user_email_verify` varchar(10),
	`user_email_verify_expires` datetime,
	`user_suspended` tinyint DEFAULT 0,
	`user_admin` tinyint DEFAULT 0,
	`user_profile_picture` varchar(255) DEFAULT '',
	`user_banner` varchar(255) DEFAULT '',
	`user_name` varchar(100) DEFAULT '',
	`user_website` varchar(255) DEFAULT '',
	`user_bio` text,
	CONSTRAINT `users_user_id` PRIMARY KEY(`user_id`),
	CONSTRAINT `users_user_username_unique` UNIQUE(`user_username`),
	CONSTRAINT `users_user_email_unique` UNIQUE(`user_email`)
);
--> statement-breakpoint
CREATE TABLE `videos` (
	`video_id` int AUTO_INCREMENT NOT NULL,
	`video_url` varchar(255),
	`video_vimeo_id` varchar(100),
	`video_title` varchar(255),
	`video_user_id` int NOT NULL,
	`video_synopsis` text,
	`video_poster` varchar(255) DEFAULT '',
	`video_genre` varchar(100),
	`video_defi_id` int,
	`video_duration` time,
	`video_like_number` int DEFAULT 0,
	`video_date` datetime DEFAULT CURRENT_TIMESTAMP,
	`video_report_id` text,
	CONSTRAINT `videos_video_id` PRIMARY KEY(`video_id`)
);
--> statement-breakpoint
ALTER TABLE `comments` ADD CONSTRAINT `comments_comment_video_id_videos_video_id_fk` FOREIGN KEY (`comment_video_id`) REFERENCES `videos`(`video_id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `comments` ADD CONSTRAINT `comments_comment_user_id_users_user_id_fk` FOREIGN KEY (`comment_user_id`) REFERENCES `users`(`user_id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `defis` ADD CONSTRAINT `defis_defi_user_id_users_user_id_fk` FOREIGN KEY (`defi_user_id`) REFERENCES `users`(`user_id`) ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `distribution` ADD CONSTRAINT `distribution_distribution_user_id_users_user_id_fk` FOREIGN KEY (`distribution_user_id`) REFERENCES `users`(`user_id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `distribution` ADD CONSTRAINT `distribution_distribution_video_id_videos_video_id_fk` FOREIGN KEY (`distribution_video_id`) REFERENCES `videos`(`video_id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `liked` ADD CONSTRAINT `liked_liked_user_id_users_user_id_fk` FOREIGN KEY (`liked_user_id`) REFERENCES `users`(`user_id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `liked` ADD CONSTRAINT `liked_liked_video_id_videos_video_id_fk` FOREIGN KEY (`liked_video_id`) REFERENCES `videos`(`video_id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `password_reset_tokens` ADD CONSTRAINT `password_reset_tokens_user_id_users_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `saved` ADD CONSTRAINT `saved_saved_user_id_users_user_id_fk` FOREIGN KEY (`saved_user_id`) REFERENCES `users`(`user_id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `saved` ADD CONSTRAINT `saved_saved_video_id_videos_video_id_fk` FOREIGN KEY (`saved_video_id`) REFERENCES `videos`(`video_id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_sessions_userid_users_user_id_fk` FOREIGN KEY (`sessions_userid`) REFERENCES `users`(`user_id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `subscription` ADD CONSTRAINT `subscription_subscription_subscriber_id_users_user_id_fk` FOREIGN KEY (`subscription_subscriber_id`) REFERENCES `users`(`user_id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `subscription` ADD CONSTRAINT `subscription_subscription_artist_id_users_user_id_fk` FOREIGN KEY (`subscription_artist_id`) REFERENCES `users`(`user_id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `videos` ADD CONSTRAINT `videos_video_user_id_users_user_id_fk` FOREIGN KEY (`video_user_id`) REFERENCES `users`(`user_id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `videos` ADD CONSTRAINT `videos_video_defi_id_defis_defi_id_fk` FOREIGN KEY (`video_defi_id`) REFERENCES `defis`(`defi_id`) ON DELETE set null ON UPDATE no action;