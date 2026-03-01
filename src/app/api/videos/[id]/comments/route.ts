import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { comments, users } from '@/db/schema'
import { eq, desc, and } from 'drizzle-orm'
import { getCurrentUser } from '@/lib/session'

type RouteParams = { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: RouteParams) {
  const { id } = await params
  const videoId = Number(id)

  const rows = await db
    .select({
      comment_id:           comments.comment_id,
      comment_content:      comments.comment_content,
      comment_date:         comments.comment_date,
      comment_user_id:      comments.comment_user_id,
      user_username:        users.user_username,
      user_profile_picture: users.user_profile_picture,
    })
    .from(comments)
    .leftJoin(users, eq(users.user_id, comments.comment_user_id))
    .where(eq(comments.comment_video_id, videoId))
    .orderBy(desc(comments.comment_date))
    .limit(50)

  return NextResponse.json(rows)
}

const postSchema = z.object({ content: z.string().min(1).max(2000) })

export async function POST(req: Request, { params }: RouteParams) {
  const { id } = await params
  const videoId = Number(id)
  const session = await getCurrentUser()
  if (!session) return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 })

  const body   = await req.json()
  const parsed = postSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Contenu invalide.' }, { status: 400 })

  const [result] = await db.insert(comments).values({
    comment_content:  parsed.data.content,
    comment_video_id: videoId,
    comment_user_id:  session.userId,
  })

  return NextResponse.json({ ok: true, comment_id: Number(result.insertId) })
}
