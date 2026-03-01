import {
  mysqlTable,
  int,
  varchar,
  text,
  tinyint,
  datetime,
  primaryKey,
  time,
} from 'drizzle-orm/mysql-core'
import { sql } from 'drizzle-orm'

export const users = mysqlTable('users', {
  user_id:              int('user_id').autoincrement().primaryKey(),
  user_username:        varchar('user_username', { length: 50 }).notNull().unique(),
  user_email:           varchar('user_email', { length: 255 }).notNull().unique(),
  user_password:        varchar('user_password', { length: 255 }).notNull(),
  user_lastname:        varchar('user_lastname', { length: 100 }),
  user_firstname:       varchar('user_firstname', { length: 100 }),
  user_birthday:        varchar('user_birthday', { length: 20 }),
  user_status:          tinyint('user_status').default(0),            // 0=unverified, 1=verified
  user_cgu:             tinyint('user_CGU').default(0),
  user_email_verify:    varchar('user_email_verify', { length: 10 }), // 6-digit code
  user_suspended:       tinyint('user_suspended').default(0),
  user_admin:           tinyint('user_admin').default(0),
  user_profile_picture: varchar('user_profile_picture', { length: 255 }).default(''),
  user_banner:          varchar('user_banner', { length: 255 }).default(''),
  user_name:            varchar('user_name', { length: 100 }).default(''),
  user_website:         varchar('user_website', { length: 255 }).default(''),
  user_bio:             text('user_bio'),
})

export const sessions = mysqlTable('sessions', {
  sessions_userid:  int('sessions_userid').notNull().references(() => users.user_id, { onDelete: 'cascade' }),
  sessions_token:   varchar('sessions_token', { length: 64 }).notNull(),
  sessions_serial:  varchar('sessions_serial', { length: 64 }).notNull(),
  sessions_date:    datetime('sessions_date').default(sql`CURRENT_TIMESTAMP`),
})

export const defis = mysqlTable('defis', {
  defi_id:          int('defi_id').autoincrement().primaryKey(),
  defi_name:        varchar('defi_name', { length: 255 }).notNull(),
  defi_description: text('defi_description'),
  defi_timestamp:   datetime('defi_timestamp').default(sql`CURRENT_TIMESTAMP`),
  defi_image:       varchar('defi_image', { length: 255 }),
  defi_user_id:     int('defi_user_id').references(() => users.user_id, { onDelete: 'set null' }),
  defi_verified:    tinyint('defi_verified').default(0),
  defi_current:     tinyint('defi_current').default(0),
  defi_date_end:    varchar('defi_date_end', { length: 50 }),
})

export const videos = mysqlTable('videos', {
  video_id:          int('video_id').autoincrement().primaryKey(),
  video_url:         varchar('video_url', { length: 255 }),           // Vimeo numeric ID
  video_vimeo_id:    varchar('video_vimeo_id', { length: 100 }),
  video_title:       varchar('video_title', { length: 255 }),
  video_user_id:     int('video_user_id').notNull().references(() => users.user_id, { onDelete: 'cascade' }),
  video_synopsis:    text('video_synopsis'),
  video_poster:      varchar('video_poster', { length: 255 }).default(''),
  video_genre:       varchar('video_genre', { length: 100 }),
  video_defi_id:     int('video_defi_id').references(() => defis.defi_id, { onDelete: 'set null' }),
  video_duration:    time('video_duration'),
  video_like_number: int('video_like_number').default(0),
  video_date:        datetime('video_date').default(sql`CURRENT_TIMESTAMP`),
  video_report_id:   text('video_report_id'),
})

export const comments = mysqlTable('comments', {
  comment_id:        int('comment_id').autoincrement().primaryKey(),
  comment_content:   text('comment_content').notNull(),
  comment_video_id:  int('comment_video_id').references(() => videos.video_id, { onDelete: 'cascade' }),
  comment_user_id:   int('comment_user_id').references(() => users.user_id, { onDelete: 'cascade' }),
  comment_date:      datetime('comment_date').default(sql`CURRENT_TIMESTAMP`),
  comment_report_id: text('comment_report_id'),
})

export const liked = mysqlTable('liked', {
  liked_user_id:  int('liked_user_id').notNull().references(() => users.user_id, { onDelete: 'cascade' }),
  liked_video_id: int('liked_video_id').notNull().references(() => videos.video_id, { onDelete: 'cascade' }),
}, (table) => [
  primaryKey({ columns: [table.liked_user_id, table.liked_video_id] }),
])

export const saved = mysqlTable('saved', {
  saved_user_id:  int('saved_user_id').notNull().references(() => users.user_id, { onDelete: 'cascade' }),
  saved_video_id: int('saved_video_id').notNull().references(() => videos.video_id, { onDelete: 'cascade' }),
}, (table) => [
  primaryKey({ columns: [table.saved_user_id, table.saved_video_id] }),
])

export const subscription = mysqlTable('subscription', {
  subscription_id:            int('subscription_id').autoincrement().primaryKey(),
  subscription_subscriber_id: int('subscription_subscriber_id').references(() => users.user_id, { onDelete: 'cascade' }),
  subscription_artist_id:     int('subscription_artist_id').references(() => users.user_id, { onDelete: 'cascade' }),
})

export const distribution = mysqlTable('distribution', {
  distribution_user_id:  int('distribution_user_id').references(() => users.user_id, { onDelete: 'cascade' }),
  distribution_video_id: int('distribution_video_id').references(() => videos.video_id, { onDelete: 'cascade' }),
})

// TypeScript types inferred from schema
export type User = typeof users.$inferSelect
export type NewUser = typeof users.$inferInsert
export type Video = typeof videos.$inferSelect
export type NewVideo = typeof videos.$inferInsert
export type Defi = typeof defis.$inferSelect
export type NewDefi = typeof defis.$inferInsert
export type Comment = typeof comments.$inferSelect
export type NewComment = typeof comments.$inferInsert
export type Session = typeof sessions.$inferSelect
export type Subscription = typeof subscription.$inferSelect
export type Distribution = typeof distribution.$inferSelect
