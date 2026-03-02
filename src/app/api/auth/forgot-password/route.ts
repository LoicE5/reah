import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { users, passwordResetTokens } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { generatePasswordResetToken } from '@/lib/auth'
import { sendPasswordResetEmail } from '@/lib/email'
import { isRateLimited, getClientIp } from '@/lib/rateLimit'

const schema = z.object({
  email: z.string().email('Adresse e-mail invalide')
})

export async function POST(req: Request) {
  if (isRateLimited(`forgot-pw:${getClientIp(req)}`, 3, 60 * 60 * 1000)) {
    return NextResponse.json({ ok: true }) // Don't reveal rate limiting to avoid enumeration
  }
  try {
    const body   = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const { email } = parsed.data

    const [user] = await db
      .select({ id: users.user_id })
      .from(users)
      .where(eq(users.user_email, email))
      .limit(1)

    // Always return success to prevent email enumeration
    if (user) {
      const { raw, hash } = generatePasswordResetToken()
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

      // Invalidate any existing tokens for this user
      await db.delete(passwordResetTokens).where(eq(passwordResetTokens.user_id, user.id))

      await db.insert(passwordResetTokens).values({
        user_id:    user.id,
        token_hash: hash,
        expires_at: expiresAt,
      })

      const resetLink = `${process.env.NEXT_PUBLIC_BASE_URL}/change-password?token=${raw}`
      try {
        await sendPasswordResetEmail(email, resetLink)
      } catch (emailError: unknown) {
        console.error('[auth/forgot-password] email send failed:', emailError)
      }
    }

    return NextResponse.json({ ok: true })
  } catch (error: unknown) {
    console.error('[auth/forgot-password]', error)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
