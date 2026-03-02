import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { generateVerificationCode } from '@/lib/auth'
import { sendVerificationEmail } from '@/lib/email'
import { isRateLimited, getClientIp } from '@/lib/rateLimit'

const schema = z.object({ email: z.string().email() })

export async function POST(req: Request) {
  if (isRateLimited(`resend-code:${getClientIp(req)}`, 3, 60 * 60 * 1000)) {
    return NextResponse.json({ ok: true }) // Silent to avoid email enumeration
  }
  const body = await req.json()
  const parsed = schema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Email invalide.' }, { status: 400 })

  const { email } = parsed.data
  const [user] = await db.select({ user_id: users.user_id, user_status: users.user_status })
    .from(users).where(eq(users.user_email, email)).limit(1)

  if (!user) {
    // Don't reveal whether account exists
    return NextResponse.json({ ok: true })
  }

  if (user.user_status === 1) {
    return NextResponse.json({ error: 'Ce compte est déjà vérifié.' }, { status: 400 })
  }

  const code = generateVerificationCode()
  const verifyExpires = new Date(Date.now() + 24 * 60 * 60 * 1000)
  await db.update(users)
    .set({ user_email_verify: code, user_email_verify_expires: verifyExpires })
    .where(eq(users.user_email, email))
  await sendVerificationEmail(email, code)

  return NextResponse.json({ ok: true })
}
