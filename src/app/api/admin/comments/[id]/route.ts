import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { comments } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/session';

type RouteParams = { params: Promise<{ id: string }> };

export async function DELETE(_req: Request, { params }: RouteParams) {
  const session = await getCurrentUser();
  if (!session?.isAdmin) return NextResponse.json({ error: 'Non autorisé.' }, { status: 403 });

  const { id } = await params;
  const commentId = Number(id);

  await db.delete(comments).where(eq(comments.comment_id, commentId));
  return NextResponse.json({ ok: true });
}
