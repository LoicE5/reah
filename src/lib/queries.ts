/**
 * Shared DB query helpers used across multiple pages.
 * All functions run server-side.
 */
import { db } from './db'
import { videos, users, defis, comments, liked, saved, subscription } from '@/db/schema'
import { eq, desc, inArray, count, sql } from 'drizzle-orm'

/** Type returned by all video list queries. */
export type VideoRow = {
  video_id:          number
  video_url:         string | null
  video_title:       string | null
  video_poster:      string | null
  video_like_number: number
  video_user_id:     number
  user_username:     string | null
  user_profile_picture: string | null
  commentCount:      number
}

const videoSelect = {
  video_id:          videos.video_id,
  video_url:         videos.video_url,
  video_title:       videos.video_title,
  video_poster:      videos.video_poster,
  video_like_number: videos.video_like_number,
  video_user_id:     videos.video_user_id,
  user_username:     users.user_username,
  user_profile_picture: users.user_profile_picture
}

type VideoRowRaw = Omit<VideoRow, 'commentCount' | 'video_like_number'> & { video_like_number: number | null }

async function withCommentCounts(rows: VideoRowRaw[]): Promise<VideoRow[]> {
  if (rows.length === 0) return []
  const ids = rows.map(video => video.video_id)
  const counts = await db
    .select({ video_id: comments.comment_video_id, cnt: count() })
    .from(comments)
    .where(inArray(comments.comment_video_id, ids))
    .groupBy(comments.comment_video_id)
  const countMap = Object.fromEntries(counts.map(countRow => [countRow.video_id!, countRow.cnt]))
  return rows.map(video => ({
    ...video,
    video_like_number: video.video_like_number ?? 0,
    commentCount: countMap[video.video_id] ?? 0,
  }))
}

/** Feed for subscribed users (following feed). */
export async function getSubscribedFeed(userId: number, limit = 20): Promise<VideoRow[]> {
  const rows = await db
    .select(videoSelect)
    .from(videos)
    .leftJoin(users, eq(users.user_id, videos.video_user_id))
    .innerJoin(subscription, eq(subscription.subscription_artist_id, videos.video_user_id))
    .where(eq(subscription.subscription_subscriber_id, userId))
    .orderBy(desc(videos.video_id))
    .limit(limit)
  return withCommentCounts(rows)
}

/** Latest videos for guest users. */
export async function getLatestVideos(limit = 20): Promise<VideoRow[]> {
  const rows = await db
    .select(videoSelect)
    .from(videos)
    .leftJoin(users, eq(users.user_id, videos.video_user_id))
    .orderBy(desc(videos.video_id))
    .limit(limit)
  return withCommentCounts(rows)
}

/** Random videos for the "Explorer" tab. */
export async function getExploreVideos(limit = 20): Promise<VideoRow[]> {
  const rows = await db
    .select(videoSelect)
    .from(videos)
    .leftJoin(users, eq(users.user_id, videos.video_user_id))
    .orderBy(sql`RAND()`)
    .limit(limit)
  return withCommentCounts(rows)
}

/** Active challenges (defi_current=1). */
export async function getCurrentDefis(limit = 20) {
  return db
    .select()
    .from(defis)
    .where(eq(defis.defi_current, 1))
    .limit(limit)
}

/** All verified challenges. */
export async function getVerifiedDefis(limit = 50) {
  return db
    .select()
    .from(defis)
    .where(eq(defis.defi_verified, 1))
    .limit(limit)
}

/** IDs of videos liked by a user (for marking like state in lists). */
export async function getLikedVideoIds(userId: number, videoIds: number[]): Promise<Set<number>> {
  if (videoIds.length === 0) return new Set()
  const rows = await db
    .select({ id: liked.liked_video_id })
    .from(liked)
    .where(inArray(liked.liked_video_id, videoIds))
  // Filter to only those belonging to this user
  const all = await db
    .select({ id: liked.liked_video_id })
    .from(liked)
    .where(eq(liked.liked_user_id, userId))
  const userSet = new Set(all.map(row => row.id))
  return userSet
}

/** IDs of videos saved by a user. */
export async function getSavedVideoIds(userId: number): Promise<Set<number>> {
  const rows = await db
    .select({ id: saved.saved_video_id })
    .from(saved)
    .where(eq(saved.saved_user_id, userId))
  return new Set(rows.map(row => row.id))
}

/** Videos saved by a user (for the saved page). */
export async function getSavedVideos(userId: number): Promise<VideoRow[]> {
  const rows = await db
    .select({
      ...videoSelect
    })
    .from(saved)
    .innerJoin(videos, eq(videos.video_id, saved.saved_video_id))
    .leftJoin(users, eq(users.user_id, videos.video_user_id))
    .where(eq(saved.saved_user_id, userId))
  return withCommentCounts(rows)
}

/** User's own videos (for profile page). */
export async function getUserVideos(userId: number): Promise<VideoRow[]> {
  const rows = await db
    .select(videoSelect)
    .from(videos)
    .leftJoin(users, eq(users.user_id, videos.video_user_id))
    .where(eq(videos.video_user_id, userId))
    .orderBy(desc(videos.video_id))
  return withCommentCounts(rows)
}
