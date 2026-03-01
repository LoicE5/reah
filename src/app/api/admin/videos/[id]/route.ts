import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { videos, comments, liked, saved, distribution } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { getCurrentUser } from '@/lib/session'

type RouteParams = { params: Promise<{ id: string }> }

export async function DELETE(_req: Request, { params }: RouteParams) {
  const session = await getCurrentUser()
  if (!session?.isAdmin) return NextResponse.json({ error: 'Non autorisé.' }, { status: 403 })

  const { id } = await params
  const videoId = Number(id)

  await db.transaction(async (tx) => {
    await tx.delete(distribution).where(eq(distribution.distribution_video_id, videoId))
    await tx.delete(comments).where(eq(comments.comment_video_id, videoId))
    await tx.delete(saved).where(eq(saved.saved_video_id, videoId))
    await tx.delete(liked).where(eq(liked.liked_video_id, videoId))
    await tx.delete(videos).where(eq(videos.video_id, videoId))
  })

  return NextResponse.json({ ok: true })
}
