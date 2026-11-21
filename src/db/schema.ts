import {
  pgTable,
  integer,
  varchar,
  text,
  smallint,
  timestamp,
  primaryKey,
  index
} from 'drizzle-orm/pg-core'

// The initial migration applies the ICU collation used for legacy identifiers and search.
export const users = pgTable('users', {
  user_id:                    integer('user_id').generatedByDefaultAsIdentity().primaryKey(),
  user_username:              varchar('user_username', { length: 50 }).notNull().unique(),
  user_email:                 varchar('user_email', { length: 255 }).notNull().unique(),
  user_password:              varchar('user_password', { length: 255 }).notNull(),
  user_lastname:              varchar('user_lastname', { length: 100 }),
  user_firstname:             varchar('user_firstname', { length: 100 }),
  user_birthday:              varchar('user_birthday', { length: 20 }),
  user_status:                smallint('user_status').default(0),            // 0=unverified, 1=verified
  user_cgu:                   smallint('user_cgu').default(0),
  user_email_verify:          varchar('user_email_verify', { length: 10 }), // 6-digit code
  user_email_verify_expires:  timestamp('user_email_verify_expires', { withTimezone: true, precision: 0 }),         // expiry for verify code
  user_suspended:             smallint('user_suspended').default(0),
  user_admin:                 smallint('user_admin').default(0),
  user_profile_picture:       varchar('user_profile_picture', { length: 255 }).default(''),
  user_banner:                varchar('user_banner', { length: 255 }).default(''),
  user_name:                  varchar('user_name', { length: 100 }).default(''),
  user_website:               varchar('user_website', { length: 255 }).default(''),
  user_bio:                   text('user_bio')
})

export const sessions = pgTable('sessions', {
  sessions_userid:  integer('sessions_userid').notNull().references(() => users.user_id, { onDelete: 'cascade' }),
  sessions_token:   varchar('sessions_token', { length: 64 }).primaryKey(),
  sessions_serial:  varchar('sessions_serial', { length: 64 }).notNull(),
  sessions_date:    timestamp('sessions_date', { withTimezone: true, precision: 0 }).defaultNow()
}, table => [
  index('sessions_userid_idx').on(table.sessions_userid)
])

export const defis = pgTable('defis', {
  defi_id:          integer('defi_id').generatedByDefaultAsIdentity().primaryKey(),
  defi_name:        varchar('defi_name', { length: 255 }).notNull(),
  defi_description: text('defi_description'),
  defi_timestamp:   timestamp('defi_timestamp', { withTimezone: true, precision: 0 }).defaultNow(),
  defi_image:       varchar('defi_image', { length: 255 }),
  defi_user_id:     integer('defi_user_id').references(() => users.user_id, { onDelete: 'set null' }),
  defi_verified:    smallint('defi_verified').default(0),
  defi_current:     smallint('defi_current').default(0),
  defi_date_end:    varchar('defi_date_end', { length: 50 })
}, table => [
  index('defi_user_id_idx').on(table.defi_user_id)
])

export const videos = pgTable('videos', {
  video_id:          integer('video_id').generatedByDefaultAsIdentity().primaryKey(),
  video_url:         varchar('video_url', { length: 255 }),           // Vimeo numeric ID
  video_vimeo_id:    varchar('video_vimeo_id', { length: 100 }),
  video_title:       varchar('video_title', { length: 255 }),
  video_user_id:     integer('video_user_id').notNull().references(() => users.user_id, { onDelete: 'cascade' }),
  video_synopsis:    text('video_synopsis'),
  video_poster:      varchar('video_poster', { length: 255 }).default(''),
  video_genre:       varchar('video_genre', { length: 100 }),
  video_defi_id:     integer('video_defi_id').references(() => defis.defi_id, { onDelete: 'set null' }),
  // MySQL TIME can represent signed durations up to 838:59:59. Preserve their display format.
  video_duration:    varchar('video_duration', { length: 10 }),
  video_like_number: integer('video_like_number').default(0),
  video_date:        timestamp('video_date', { withTimezone: true, precision: 0 }).defaultNow(),
  video_report_id:   text('video_report_id')
}, table => [
  index('video_user_id_idx').on(table.video_user_id),
  index('video_defi_id_idx').on(table.video_defi_id)
])

export const comments = pgTable('comments', {
  comment_id:        integer('comment_id').generatedByDefaultAsIdentity().primaryKey(),
  comment_content:   text('comment_content').notNull(),
  comment_video_id:  integer('comment_video_id').references(() => videos.video_id, { onDelete: 'cascade' }),
  comment_user_id:   integer('comment_user_id').references(() => users.user_id, { onDelete: 'cascade' }),
  comment_date:      timestamp('comment_date', { withTimezone: true, precision: 0 }).defaultNow(),
  comment_report_id: text('comment_report_id')
}, table => [
  index('comment_video_id_idx').on(table.comment_video_id),
  index('comment_user_id_idx').on(table.comment_user_id)
])

export const liked = pgTable('liked', {
  liked_user_id:  integer('liked_user_id').notNull().references(() => users.user_id, { onDelete: 'cascade' }),
  liked_video_id: integer('liked_video_id').notNull().references(() => videos.video_id, { onDelete: 'cascade' })
}, table => [
  primaryKey({ columns: [table.liked_user_id, table.liked_video_id] }),
  index('liked_video_id_idx').on(table.liked_video_id)
])

export const saved = pgTable('saved', {
  saved_user_id:  integer('saved_user_id').notNull().references(() => users.user_id, { onDelete: 'cascade' }),
  saved_video_id: integer('saved_video_id').notNull().references(() => videos.video_id, { onDelete: 'cascade' })
}, table => [
  primaryKey({ columns: [table.saved_user_id, table.saved_video_id] }),
  index('saved_video_id_idx').on(table.saved_video_id)
])

export const subscription = pgTable('subscription', {
  subscription_id:            integer('subscription_id').generatedByDefaultAsIdentity().primaryKey(),
  subscription_subscriber_id: integer('subscription_subscriber_id').references(() => users.user_id, { onDelete: 'cascade' }),
  subscription_artist_id:     integer('subscription_artist_id').references(() => users.user_id, { onDelete: 'cascade' })
}, table => [
  index('subscription_subscriber_id_idx').on(table.subscription_subscriber_id),
  index('subscription_artist_id_idx').on(table.subscription_artist_id)
])

export const distribution = pgTable('distribution', {
  distribution_user_id:  integer('distribution_user_id').notNull().references(() => users.user_id, { onDelete: 'cascade' }),
  distribution_video_id: integer('distribution_video_id').notNull().references(() => videos.video_id, { onDelete: 'cascade' })
}, table => [
  primaryKey({ columns: [table.distribution_user_id, table.distribution_video_id] }),
  index('distribution_video_id_idx').on(table.distribution_video_id)
])

export const passwordResetTokens = pgTable('password_reset_tokens', {
  id:         integer('id').generatedByDefaultAsIdentity().primaryKey(),
  user_id:    integer('user_id').notNull().references(() => users.user_id, { onDelete: 'cascade' }),
  token_hash: varchar('token_hash', { length: 64 }).notNull().unique(), // SHA-256 hex of the raw token
  expires_at: timestamp('expires_at', { withTimezone: true, precision: 0 }).notNull(),
  used_at:    timestamp('used_at', { withTimezone: true, precision: 0 }),
  created_at: timestamp('created_at', { withTimezone: true, precision: 0 }).defaultNow()
}, table => [
  index('password_reset_tokens_user_id_idx').on(table.user_id)
])

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
