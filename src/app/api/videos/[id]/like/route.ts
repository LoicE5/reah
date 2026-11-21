import { NextResponse } from 'next/server'
import { db, type DatabaseTransaction } from '@/lib/db'
import { videos, liked } from '@/db/schema'
import { eq, and, sql } from 'drizzle-orm'
import { getCurrentUser } from '@/lib/session'

type RouteParams = { params: Promise<{ id: string }> }

export async function POST(_req: Request, { params }: RouteParams) {
  const { id } = await params
  const videoId = Number(id)
  const session = await getCurrentUser()
  if (!session) return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 })

  const video = await db.transaction(async (transaction: DatabaseTransaction) => {
    const [inserted] = await transaction.insert(liked)
      .values({ liked_user_id: session.userId, liked_video_id: videoId })
      .onConflictDoNothing({ target: [liked.liked_user_id, liked.liked_video_id] })
      .returning({ id: liked.liked_video_id })
    if (!inserted) return null

    const [updated] = await transaction.update(videos)
      .set({ video_like_number: sql`${videos.video_like_number} + 1` })
      .where(eq(videos.video_id, videoId))
      .returning({ likes: videos.video_like_number })
    return updated
  })
  if (!video) return NextResponse.json({ error: 'Déjà aimé.' }, { status: 409 })

  return NextResponse.json({ ok: true, likes: video.likes })
}

export async function DELETE(_req: Request, { params }: RouteParams) {
  const { id } = await params
  const videoId = Number(id)
  const session = await getCurrentUser()
  if (!session) return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 })

  const video = await db.transaction(async (transaction: DatabaseTransaction) => {
    const [deleted] = await transaction.delete(liked)
      .where(and(eq(liked.liked_user_id, session.userId), eq(liked.liked_video_id, videoId)))
      .returning({ id: liked.liked_video_id })

    if (!deleted) {
      const [existing] = await transaction.select({ likes: videos.video_like_number })
        .from(videos)
        .where(eq(videos.video_id, videoId))
      return existing
    }

    const [updated] = await transaction.update(videos)
      .set({ video_like_number: sql`case when ${videos.video_like_number} <= 0 then 0 else ${videos.video_like_number} - 1 end` })
      .where(eq(videos.video_id, videoId))
      .returning({ likes: videos.video_like_number })
    return updated
  })
  if (!video) return NextResponse.json({ error: 'Vidéo introuvable.' }, { status: 404 })

  return NextResponse.json({ ok: true, likes: video.likes })
}
