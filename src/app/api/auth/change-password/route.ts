import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { users, passwordResetTokens } from '@/db/schema'
import { eq, and, isNull, gt } from 'drizzle-orm'
import { hashPassword, verifyPassword, isValidPassword, hashResetToken } from '@/lib/auth'
import { getCurrentUser } from '@/lib/session'

const resetSchema = z.object({
  mode:        z.literal('reset'),
  token:       z.string().min(1),
  newPassword: z.string().min(8)
})

const changeSchema = z.object({
  mode:        z.literal('change'),
  prevPassword: z.string().min(1),
  newPassword:  z.string().min(8)
})

const schema = z.discriminatedUnion('mode', [resetSchema, changeSchema])

export async function POST(req: Request) {
  try {
    const body   = await req.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Données invalides.' }, { status: 400 })
    }

    if (!isValidPassword(parsed.data.newPassword)) {
      return NextResponse.json(
        { error: 'Le mot de passe doit contenir au moins 8 caractères, une majuscule et une minuscule.' },
        { status: 400 }
      )
    }

    const hashed = await hashPassword(parsed.data.newPassword)

    if (parsed.data.mode === 'reset') {
      const tokenHash = hashResetToken(parsed.data.token)
      const now = new Date()

      const [tokenRow] = await db
        .select({ id: passwordResetTokens.id, user_id: passwordResetTokens.user_id })
        .from(passwordResetTokens)
        .where(
          and(
            eq(passwordResetTokens.token_hash, tokenHash),
            gt(passwordResetTokens.expires_at, now),
            isNull(passwordResetTokens.used_at)
          )
        )
        .limit(1)

      if (!tokenRow) {
        return NextResponse.json({ error: 'Lien invalide ou expiré.' }, { status: 400 })
      }

      // Mark token as used and update password atomically
      await db.update(passwordResetTokens)
        .set({ used_at: now })
        .where(eq(passwordResetTokens.id, tokenRow.id))

      await db.update(users)
        .set({ user_password: hashed })
        .where(eq(users.user_id, tokenRow.user_id))

    } else {
      const session = await getCurrentUser()
      if (!session) {
        return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 })
      }
      const [user] = await db
        .select({ id: users.user_id, password: users.user_password })
        .from(users)
        .where(eq(users.user_id, session.userId))
        .limit(1)
      if (!user) {
        return NextResponse.json({ error: 'Utilisateur introuvable.' }, { status: 404 })
      }
      const ok = await verifyPassword(parsed.data.prevPassword, user.password)
      if (!ok) {
        return NextResponse.json({ error: 'Mot de passe actuel incorrect.' }, { status: 400 })
      }
      await db.update(users).set({ user_password: hashed }).where(eq(users.user_id, user.id))
    }

    return NextResponse.json({ ok: true })
  } catch (error: unknown) {
    console.error('[auth/change-password]', error)
    return NextResponse.json({ error: 'Erreur serveur.' }, { status: 500 })
  }
}
