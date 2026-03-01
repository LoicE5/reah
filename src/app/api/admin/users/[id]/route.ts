import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users, videos, comments, liked, saved, subscription, distribution } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/session';

type RouteParams = { params: Promise<{ id: string }> };

export async function DELETE(_req: Request, { params }: RouteParams) {
  const session = await getCurrentUser();
  if (!session?.isAdmin) return NextResponse.json({ error: 'Non autorisé.' }, { status: 403 });

  const { id } = await params;
  const userId = Number(id);

  await db.transaction(async (tx) => {
    const userVideos = await tx.select({ video_id: videos.video_id }).from(videos).where(eq(videos.video_user_id, userId));
    for (const { video_id } of userVideos) {
      await tx.delete(distribution).where(eq(distribution.distribution_video_id, video_id));
      await tx.delete(comments).where(eq(comments.comment_video_id, video_id));
      await tx.delete(saved).where(eq(saved.saved_video_id, video_id));
      await tx.delete(liked).where(eq(liked.liked_video_id, video_id));
      await tx.delete(videos).where(eq(videos.video_id, video_id));
    }
    await tx.delete(comments).where(eq(comments.comment_user_id, userId));
    await tx.delete(liked).where(eq(liked.liked_user_id, userId));
    await tx.delete(saved).where(eq(saved.saved_user_id, userId));
    await tx.delete(subscription).where(eq(subscription.subscription_subscriber_id, userId));
    await tx.delete(subscription).where(eq(subscription.subscription_artist_id, userId));
    await tx.delete(users).where(eq(users.user_id, userId));
  });

  return NextResponse.json({ ok: true });
}
