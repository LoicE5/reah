import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'

const schema = z.object({
  email: z.string().email(),
  code:  z.string().length(6),
})

export async function POST(req: Request) {
  try {
    const body   = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Données invalides.' }, { status: 400 })
    }

    const { email, code } = parsed.data

    const [user] = await db
      .select({ id: users.user_id, verifyCode: users.user_email_verify, status: users.user_status })
      .from(users)
      .where(eq(users.user_email, email))
      .limit(1)

    if (!user) {
      return NextResponse.json({ error: 'Aucun compte trouvé pour cet e-mail.' }, { status: 404 })
    }

    if (user.status === 1) {
      return NextResponse.json({ error: 'Ce compte est déjà vérifié.' }, { status: 409 })
    }

    if (user.verifyCode !== code) {
      return NextResponse.json({ error: 'Code incorrect.' }, { status: 400 })
    }

    await db
      .update(users)
      .set({ user_status: 1, user_email_verify: null })
      .where(eq(users.user_id, user.id))

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[auth/verify-email]', err)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
