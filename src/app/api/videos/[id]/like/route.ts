import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { videos, liked } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/session';

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(_req: Request, { params }: RouteParams) {
  const { id } = await params;
  const videoId = Number(id);
  const session = await getCurrentUser();
  if (!session) return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 });

  // Check if already liked
  const [existing] = await db
    .select()
    .from(liked)
    .where(and(eq(liked.liked_user_id, session.userId), eq(liked.liked_video_id, videoId)))
    .limit(1);
  if (existing) return NextResponse.json({ error: 'Déjà aimé.' }, { status: 409 });

  await db.transaction(async (tx) => {
    await tx.insert(liked).values({ liked_user_id: session.userId, liked_video_id: videoId });
    // Atomic increment — avoids race condition
    await tx.update(videos)
      .set({ video_like_number: sql`${videos.video_like_number} + 1` })
      .where(eq(videos.video_id, videoId));
  });

  const [{ video_like_number }] = await db
    .select({ video_like_number: videos.video_like_number })
    .from(videos)
    .where(eq(videos.video_id, videoId))
    .limit(1);

  return NextResponse.json({ ok: true, likes: video_like_number });
}

export async function DELETE(_req: Request, { params }: RouteParams) {
  const { id } = await params;
  const videoId = Number(id);
  const session = await getCurrentUser();
  if (!session) return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 });

  await db.transaction(async (tx) => {
    await tx.delete(liked).where(and(eq(liked.liked_user_id, session.userId), eq(liked.liked_video_id, videoId)));
    await tx.update(videos)
      .set({ video_like_number: sql`GREATEST(${videos.video_like_number} - 1, 0)` })
      .where(eq(videos.video_id, videoId));
  });

  const [{ video_like_number }] = await db
    .select({ video_like_number: videos.video_like_number })
    .from(videos)
    .where(eq(videos.video_id, videoId))
    .limit(1);

  return NextResponse.json({ ok: true, likes: video_like_number });
}
