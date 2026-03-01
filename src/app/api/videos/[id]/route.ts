import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { videos, users, defis, comments, liked, saved, distribution } from '@/db/schema'
import { eq, count, and, sql } from 'drizzle-orm'
import { getCurrentUser } from '@/lib/session'
import { unlink, writeFile } from 'fs/promises'
import { join } from 'path'
import { randomUUID } from 'crypto'

type RouteParams = { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: RouteParams) {
  const { id } = await params
  const videoId = Number(id)
  if (isNaN(videoId)) return NextResponse.json({ error: 'ID invalide.' }, { status: 400 })

  const session = await getCurrentUser()

  const [video] = await db
    .select({
      video_id:          videos.video_id,
      video_url:         videos.video_url,
      video_vimeo_id:    videos.video_vimeo_id,
      video_title:       videos.video_title,
      video_synopsis:    videos.video_synopsis,
      video_poster:      videos.video_poster,
      video_genre:       videos.video_genre,
      video_duration:    videos.video_duration,
      video_like_number: videos.video_like_number,
      video_date:        videos.video_date,
      video_user_id:     videos.video_user_id,
      video_defi_id:     videos.video_defi_id,
      user_username:     users.user_username,
      user_profile_picture: users.user_profile_picture,
    })
    .from(videos)
    .leftJoin(users, eq(users.user_id, videos.video_user_id))
    .where(eq(videos.video_id, videoId))
    .limit(1)

  if (!video) return NextResponse.json({ error: 'Vidéo introuvable.' }, { status: 404 })

  // Fetch defi name if linked
  let defiName: string | null = null
  if (video.video_defi_id) {
    const [defi] = await db
      .select({ defi_name: defis.defi_name })
      .from(defis)
      .where(eq(defis.defi_id, video.video_defi_id!))
      .limit(1)
    defiName = defi?.defi_name ?? null
  }

  // Fetch comment count
  const [{ commentCount }] = await db
    .select({ commentCount: count() })
    .from(comments)
    .where(eq(comments.comment_video_id, videoId))

  // Fetch distribution (collaborators)
  const distributors = await db
    .select({ user_id: users.user_id, user_username: users.user_username, user_profile_picture: users.user_profile_picture })
    .from(distribution)
    .leftJoin(users, eq(users.user_id, distribution.distribution_user_id))
    .where(eq(distribution.distribution_video_id, videoId))

  // Liked / saved by current user
  let isLiked = false
  let isSaved = false
  if (session) {
    const [likedRow] = await db
      .select()
      .from(liked)
      .where(and(eq(liked.liked_user_id, session.userId), eq(liked.liked_video_id, videoId)))
      .limit(1)
    const [savedRow] = await db
      .select()
      .from(saved)
      .where(and(eq(saved.saved_user_id, session.userId), eq(saved.saved_video_id, videoId)))
      .limit(1)
    isLiked = !!likedRow
    isSaved = !!savedRow
  }

  return NextResponse.json({ ...video, defiName, commentCount, distributors, isLiked, isSaved })
}

const patchSchema = z.object({
  title:    z.string().min(1).optional(),
  synopsis: z.string().optional(),
})

export async function PATCH(req: Request, { params }: RouteParams) {
  const { id } = await params
  const videoId = Number(id)
  const session = await getCurrentUser()
  if (!session) return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 })

  const [video] = await db.select({ video_user_id: videos.video_user_id }).from(videos).where(eq(videos.video_id, videoId)).limit(1)
  if (!video) return NextResponse.json({ error: 'Vidéo introuvable.' }, { status: 404 })
  if (video.video_user_id !== session.userId && !session.isAdmin) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 403 })
  }

  const body   = await req.json()
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Données invalides.' }, { status: 400 })

  await db.update(videos).set({
    ...(parsed.data.title    !== undefined && { video_title:    parsed.data.title }),
    ...(parsed.data.synopsis !== undefined && { video_synopsis: parsed.data.synopsis }),
  }).where(eq(videos.video_id, videoId))

  return NextResponse.json({ ok: true })
}

export async function DELETE(_req: Request, { params }: RouteParams) {
  const { id } = await params
  const videoId = Number(id)
  const session = await getCurrentUser()
  if (!session) return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 })

  const [video] = await db
    .select({ video_user_id: videos.video_user_id, video_poster: videos.video_poster })
    .from(videos)
    .where(eq(videos.video_id, videoId))
    .limit(1)
  if (!video) return NextResponse.json({ error: 'Vidéo introuvable.' }, { status: 404 })
  if (video.video_user_id !== session.userId && !session.isAdmin) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 403 })
  }

  await db.transaction(async (tx) => {
    await tx.delete(distribution).where(eq(distribution.distribution_video_id, videoId))
    await tx.delete(comments).where(eq(comments.comment_video_id, videoId))
    await tx.delete(saved).where(eq(saved.saved_video_id, videoId))
    await tx.delete(liked).where(eq(liked.liked_video_id, videoId))
    await tx.delete(videos).where(eq(videos.video_id, videoId))
  })

  // Delete poster file if exists
  if (video.video_poster) {
    try {
      await unlink(join(process.cwd(), 'public/uploads/videos_posters', video.video_poster))
    } catch { /* file may not exist */ }
  }

  return NextResponse.json({ ok: true })
}
