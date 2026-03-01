import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { generateVerificationCode } from '@/lib/auth'
import { sendVerificationEmail } from '@/lib/email'

const schema = z.object({ email: z.string().email() })

export async function POST(req: Request) {
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
  await db.update(users).set({ user_email_verify: code }).where(eq(users.user_email, email))
  await sendVerificationEmail(email, code)

  return NextResponse.json({ ok: true })
}
