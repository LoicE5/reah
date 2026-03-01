import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { users } from '@/db/schema';
import { eq, or } from 'drizzle-orm';
import { verifyPassword } from '@/lib/auth';
import { getSession } from '@/lib/session';

const loginSchema = z.object({
  credential: z.string().min(1, 'Identifiant requis'),
  password:   z.string().min(1, 'Mot de passe requis'),
});

export async function POST(req: Request) {
  try {
    const body   = await req.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { credential, password } = parsed.data;

    // Find user by username OR email (same as PHP: WHERE user_username=? OR user_email=?)
    const [user] = await db
      .select()
      .from(users)
      .where(or(eq(users.user_username, credential), eq(users.user_email, credential)))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: 'Identifiant ou mot de passe incorrect.' }, { status: 401 });
    }

    if (user.user_status === 0) {
      return NextResponse.json(
        { error: 'Ton compte n\'est pas encore vérifié. Vérifie ta boîte mail.' },
        { status: 403 },
      );
    }

    if (user.user_suspended === 1) {
      return NextResponse.json(
        { error: 'Ton compte a été suspendu. Contacte l\'administration.' },
        { status: 403 },
      );
    }

    const passwordOk = await verifyPassword(password, user.user_password);
    if (!passwordOk) {
      return NextResponse.json({ error: 'Identifiant ou mot de passe incorrect.' }, { status: 401 });
    }

    const session = await getSession();
    session.userId     = user.user_id;
    session.username   = user.user_username;
    session.isAdmin    = user.user_admin === 1;
    session.isLoggedIn = true;
    await session.save();

    return NextResponse.json({ ok: true, username: user.user_username });
  } catch (err) {
    console.error('[auth/login]', err);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}
