import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { hashPassword, generateVerificationCode, isValidPassword } from '@/lib/auth'
import { sendVerificationEmail } from '@/lib/email'
import { isRateLimited, getClientIp } from '@/lib/rateLimit'

const signupSchema = z.object({
  lastName:  z.string().min(1, 'Nom requis'),
  firstName: z.string().min(1, 'Prénom requis'),
  username:  z.string().min(2, 'Pseudo trop court').max(50, 'Pseudo trop long'),
  email:     z.string().email('Adresse e-mail invalide'),
  password:  z.string().min(8, 'Mot de passe trop court'),
  birthday:  z.string().min(1, 'Date de naissance requise'),
  cgu:       z.boolean().refine(v => v === true, 'Tu dois accepter les CGU')
})

export async function POST(req: Request) {
  if (isRateLimited(`signup:${getClientIp(req)}`, 5, 60 * 60 * 1000)) {
    return NextResponse.json({ error: 'Trop de tentatives. Réessaie dans une heure.' }, { status: 429 })
  }
  try {
    const body   = await req.json()
    const parsed = signupSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 })
    }

    const { lastName, firstName, username, email, password, birthday, cgu } = parsed.data

    if (!isValidPassword(password)) {
      return NextResponse.json(
        { error: 'Le mot de passe doit contenir au moins 8 caractères, une majuscule et une minuscule.' },
        { status: 400 }
      )
    }

    // Check email uniqueness
    const [existingEmail] = await db
      .select({ id: users.user_id })
      .from(users)
      .where(eq(users.user_email, email))
      .limit(1)
    if (existingEmail) {
      return NextResponse.json({ error: 'Cette adresse e-mail est déjà utilisée.', field: 'email' }, { status: 409 })
    }

    // Check username uniqueness
    const [existingUsername] = await db
      .select({ id: users.user_id })
      .from(users)
      .where(eq(users.user_username, username))
      .limit(1)
    if (existingUsername) {
      return NextResponse.json({ error: 'Ce pseudo est déjà pris.', field: 'username' }, { status: 409 })
    }

    const hashedPassword = await hashPassword(password)
    const verificationCode = generateVerificationCode()
    const verifyExpires = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    await db.insert(users).values({
      user_lastname:               lastName,
      user_firstname:              firstName,
      user_username:               username,
      user_email:                  email,
      user_password:               hashedPassword,
      user_birthday:               birthday,
      user_cgu:                    cgu ? 1 : 0,
      user_status:                 0,              // unverified
      user_email_verify:           verificationCode,
      user_email_verify_expires:   verifyExpires,
    })

    // Send verification email (non-blocking on failure — don't block signup)
    try {
      await sendVerificationEmail(email, verificationCode)
    } catch (emailError: unknown) {
      console.error('[auth/signup] email send failed:', emailError)
    }

    return NextResponse.json({ ok: true, email })
  } catch (error: unknown) {
    console.error('[auth/signup]', error)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
