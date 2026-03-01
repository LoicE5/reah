import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { users, videos, subscription, comments, liked, saved, distribution } from '@/db/schema'
import { eq, count } from 'drizzle-orm'
import { getCurrentUser } from '@/lib/session'

type RouteParams = { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: RouteParams) {
  const { id } = await params
  const userId = Number(id)
  if (isNaN(userId)) return NextResponse.json({ error: 'ID invalide.' }, { status: 400 })

  const [user] = await db
    .select({
      user_id:              users.user_id,
      user_username:        users.user_username,
      user_name:            users.user_name,
      user_bio:             users.user_bio,
      user_website:         users.user_website,
      user_profile_picture: users.user_profile_picture,
      user_banner:          users.user_banner,
      user_admin:           users.user_admin,
    })
    .from(users)
    .where(eq(users.user_id, userId))
    .limit(1)

  if (!user) return NextResponse.json({ error: 'Utilisateur introuvable.' }, { status: 404 })

  const [{ followerCount }] = await db
    .select({ followerCount: count() })
    .from(subscription)
    .where(eq(subscription.subscription_artist_id, userId))

  const [{ followingCount }] = await db
    .select({ followingCount: count() })
    .from(subscription)
    .where(eq(subscription.subscription_subscriber_id, userId))

  const userVideos = await db
    .select({
      video_id:          videos.video_id,
      video_url:         videos.video_url,
      video_title:       videos.video_title,
      video_poster:      videos.video_poster,
      video_like_number: videos.video_like_number,
      video_date:        videos.video_date,
      video_defi_id:     videos.video_defi_id,
    })
    .from(videos)
    .where(eq(videos.video_user_id, userId))

  return NextResponse.json({ user, followerCount, followingCount, videos: userVideos })
}

export async function DELETE(_req: Request, { params }: RouteParams) {
  const { id } = await params
  const userId = Number(id)
  const session = await getCurrentUser()
  if (!session) return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 })
  if (session.userId !== userId && !session.isAdmin) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 403 })
  }

  await db.transaction(async (tx) => {
    // Delete user's video relationships
    const userVideos = await tx.select({ video_id: videos.video_id }).from(videos).where(eq(videos.video_user_id, userId))
    for (const { video_id } of userVideos) {
      await tx.delete(distribution).where(eq(distribution.distribution_video_id, video_id))
      await tx.delete(comments).where(eq(comments.comment_video_id, video_id))
      await tx.delete(saved).where(eq(saved.saved_video_id, video_id))
      await tx.delete(liked).where(eq(liked.liked_video_id, video_id))
      await tx.delete(videos).where(eq(videos.video_id, video_id))
    }
    // Delete user's own interactions
    await tx.delete(comments).where(eq(comments.comment_user_id, userId))
    await tx.delete(liked).where(eq(liked.liked_user_id, userId))
    await tx.delete(saved).where(eq(saved.saved_user_id, userId))
    await tx.delete(distribution).where(eq(distribution.distribution_user_id, userId))
    await tx.delete(subscription).where(eq(subscription.subscription_subscriber_id, userId))
    await tx.delete(subscription).where(eq(subscription.subscription_artist_id, userId))
    await tx.delete(users).where(eq(users.user_id, userId))
  })

  return NextResponse.json({ ok: true })
}
