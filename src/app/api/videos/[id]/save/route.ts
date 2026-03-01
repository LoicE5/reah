import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { saved } from '@/db/schema'
import { eq, and, sql } from 'drizzle-orm'
import { getCurrentUser } from '@/lib/session'

type RouteParams = { params: Promise<{ id: string }> }

export async function POST(_req: Request, { params }: RouteParams) {
  const { id } = await params
  const videoId = Number(id)
  const session = await getCurrentUser()
  if (!session) return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 })

  await db.insert(saved)
    .values({ saved_user_id: session.userId, saved_video_id: videoId })
    .onDuplicateKeyUpdate({ set: { saved_user_id: sql`saved_user_id` } })

  return NextResponse.json({ ok: true })
}

export async function DELETE(_req: Request, { params }: RouteParams) {
  const { id } = await params
  const videoId = Number(id)
  const session = await getCurrentUser()
  if (!session) return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 })

  await db.delete(saved).where(
    and(eq(saved.saved_user_id, session.userId), eq(saved.saved_video_id, videoId))
  )

  return NextResponse.json({ ok: true })
}
