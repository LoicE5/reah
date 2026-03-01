import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getCurrentUser, getSession } from '@/lib/session';
import { writeFile, mkdir, unlink } from 'fs/promises';
import { join } from 'path';
import { randomUUID } from 'crypto';

export async function PATCH(req: Request) {
  const session = await getCurrentUser();
  if (!session) return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 });

  const formData = await req.formData();
  const name     = formData.get('name') as string | null;
  const website  = formData.get('website') as string | null;
  const bio      = formData.get('bio') as string | null;
  const username = formData.get('username') as string | null;
  const avatarFile = formData.get('avatar') as File | null;
  const bannerFile = formData.get('banner') as File | null;

  const updates: Record<string, unknown> = {};
  if (name     !== null) updates.user_name    = name;
  if (website  !== null) updates.user_website = website;
  if (bio      !== null) updates.user_bio     = bio;
  if (username !== null) updates.user_username = username;

  // Handle avatar upload
  if (avatarFile && avatarFile.size > 0) {
    const ext = avatarFile.name.split('.').pop() ?? 'jpg';
    const filename = `${randomUUID()}.${ext}`;
    const dir = join(process.cwd(), 'public/uploads/profile_pictures');
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, filename), Buffer.from(await avatarFile.arrayBuffer()));
    updates.user_profile_picture = filename;

    // Delete old avatar
    const [current] = await db.select({ pic: users.user_profile_picture }).from(users).where(eq(users.user_id, session.userId)).limit(1);
    if (current?.pic) {
      await unlink(join(dir, current.pic)).catch(() => {});
    }
  }

  // Handle banner upload
  if (bannerFile && bannerFile.size > 0) {
    const ext = bannerFile.name.split('.').pop() ?? 'jpg';
    const filename = `${randomUUID()}.${ext}`;
    const dir = join(process.cwd(), 'public/uploads/banners');
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, filename), Buffer.from(await bannerFile.arrayBuffer()));
    updates.user_banner = filename;

    // Delete old banner
    const [current] = await db.select({ banner: users.user_banner }).from(users).where(eq(users.user_id, session.userId)).limit(1);
    if (current?.banner) {
      await unlink(join(dir, current.banner)).catch(() => {});
    }
  }

  if (Object.keys(updates).length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await db.update(users).set(updates as any).where(eq(users.user_id, session.userId));
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE() {
  const session = await getCurrentUser();
  if (!session) return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 });

  // Cascade delete is handled by DB FK constraints (onDelete: 'cascade')
  await db.delete(users).where(eq(users.user_id, session.userId));

  // Destroy session
  const s = await getSession();
  s.destroy();

  return NextResponse.json({ ok: true });
}
