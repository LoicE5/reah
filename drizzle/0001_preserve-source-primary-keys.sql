DROP INDEX "distribution_user_id_idx";--> statement-breakpoint
ALTER TABLE "distribution" ALTER COLUMN "distribution_user_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "distribution" ALTER COLUMN "distribution_video_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "sessions" ALTER COLUMN "sessions_token" TYPE varchar(64) COLLATE "public"."reah_text";--> statement-breakpoint
ALTER TABLE "sessions" ADD PRIMARY KEY ("sessions_token");--> statement-breakpoint
ALTER TABLE "distribution" ADD CONSTRAINT "distribution_distribution_user_id_distribution_video_id_pk" PRIMARY KEY("distribution_user_id","distribution_video_id");
