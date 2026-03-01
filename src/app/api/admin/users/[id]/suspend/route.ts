import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getCurrentUser } from '@/lib/session';

type RouteParams = { params: Promise<{ id: string }> };

export async function POST(_req: Request, { params }: RouteParams) {
  const session = await getCurrentUser();
  if (!session?.isAdmin) return NextResponse.json({ error: 'Non autorisé.' }, { status: 403 });

  const { id } = await params;
  const userId = Number(id);

  const [user] = await db.select({ suspended: users.user_suspended }).from(users).where(eq(users.user_id, userId)).limit(1);
  if (!user) return NextResponse.json({ error: 'Utilisateur introuvable.' }, { status: 404 });

  await db.update(users).set({ user_suspended: user.suspended === 1 ? 0 : 1 }).where(eq(users.user_id, userId));

  return NextResponse.json({ ok: true, suspended: user.suspended === 1 ? 0 : 1 });
}
