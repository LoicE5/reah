import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { hashPassword, verifyPassword, isValidPassword } from '@/lib/auth'
import { getCurrentUser } from '@/lib/session'

const resetSchema = z.object({
  mode:        z.literal('reset'),
  email:       z.string().email(),
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
      const [user] = await db
        .select({ id: users.user_id })
        .from(users)
        .where(eq(users.user_email, parsed.data.email))
        .limit(1)
      if (!user) {
        return NextResponse.json({ error: 'Aucun compte trouvé.' }, { status: 404 })
      }
      await db.update(users).set({ user_password: hashed }).where(eq(users.user_id, user.id))
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
