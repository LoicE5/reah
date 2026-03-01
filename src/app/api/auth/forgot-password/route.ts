import { NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { sendPasswordResetEmail } from '@/lib/email';

const schema = z.object({
  email: z.string().email('Adresse e-mail invalide'),
});

export async function POST(req: Request) {
  try {
    const body   = await req.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
    }

    const { email } = parsed.data;

    const [user] = await db
      .select({ id: users.user_id })
      .from(users)
      .where(eq(users.user_email, email))
      .limit(1);

    // Always return success to prevent email enumeration
    if (user) {
      const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL}/change-password?email=${encodeURIComponent(email)}`;
      try {
        await sendPasswordResetEmail(email, resetLink);
      } catch (emailErr) {
        console.error('[auth/forgot-password] email send failed:', emailErr);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[auth/forgot-password]', err);
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 });
  }
}
