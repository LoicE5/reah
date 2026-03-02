import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { isRateLimited, getClientIp } from '@/lib/rateLimit'

const schema = z.object({
  email: z.string().email(),
  code:  z.string().length(6)
})

export async function POST(req: Request) {
  if (isRateLimited(`verify-email:${getClientIp(req)}`, 10, 10 * 60 * 1000)) {
    return NextResponse.json({ error: 'Trop de tentatives. Réessaie dans 10 minutes.' }, { status: 429 })
  }
  try {
    const body   = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Données invalides.' }, { status: 400 })
    }

    const { email, code } = parsed.data

    const [user] = await db
      .select({
        id:         users.user_id,
        verifyCode: users.user_email_verify,
        verifyExp:  users.user_email_verify_expires,
        status:     users.user_status,
      })
      .from(users)
      .where(eq(users.user_email, email))
      .limit(1)

    // Generic error — never reveal whether the email is registered
    if (!user) {
      return NextResponse.json({ error: 'Code ou adresse e-mail invalide.' }, { status: 400 })
    }

    if (user.status === 1) {
      return NextResponse.json({ error: 'Ce compte est déjà vérifié.' }, { status: 409 })
    }

    if (!user.verifyExp || user.verifyExp < new Date()) {
      return NextResponse.json({ error: 'Code expiré. Demande un nouveau code.' }, { status: 400 })
    }

    if (user.verifyCode !== code) {
      return NextResponse.json({ error: 'Code ou adresse e-mail invalide.' }, { status: 400 })
    }

    await db
      .update(users)
      .set({ user_status: 1, user_email_verify: null, user_email_verify_expires: null })
      .where(eq(users.user_id, user.id))

    return NextResponse.json({ ok: true })
  } catch (error: unknown) {
    console.error('[auth/verify-email]', error)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
