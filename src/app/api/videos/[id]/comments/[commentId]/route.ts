import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { comments } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { getCurrentUser } from '@/lib/session'

type RouteParams = { params: Promise<{ id: string; commentId: string }> }

export async function DELETE(_req: Request, { params }: RouteParams) {
  const { commentId } = await params
  const commentIdNum = Number(commentId)
  const session = await getCurrentUser()
  if (!session) return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 })

  const [comment] = await db
    .select({ comment_user_id: comments.comment_user_id })
    .from(comments)
    .where(eq(comments.comment_id, commentIdNum))
    .limit(1)

  if (!comment) return NextResponse.json({ error: 'Commentaire introuvable.' }, { status: 404 })
  if (comment.comment_user_id !== session.userId && !session.isAdmin) {
    return NextResponse.json({ error: 'Non autorisé.' }, { status: 403 })
  }

  await db.delete(comments).where(eq(comments.comment_id, commentIdNum))
  return NextResponse.json({ ok: true })
}
