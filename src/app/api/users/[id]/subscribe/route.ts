import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { subscription } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import { getCurrentUser } from '@/lib/session'

type RouteParams = { params: Promise<{ id: string }> }

export async function POST(_req: Request, { params }: RouteParams) {
  const { id } = await params
  const artistId = Number(id)
  const session = await getCurrentUser()
  if (!session) return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 })
  if (session.userId === artistId) return NextResponse.json({ error: 'Tu ne peux pas te suivre toi-même.' }, { status: 400 })

  await db.insert(subscription)
    .values({ subscription_subscriber_id: session.userId, subscription_artist_id: artistId })

  return NextResponse.json({ ok: true })
}

export async function DELETE(_req: Request, { params }: RouteParams) {
  const { id } = await params
  const artistId = Number(id)
  const session = await getCurrentUser()
  if (!session) return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 })

  await db.delete(subscription).where(
    and(
      eq(subscription.subscription_subscriber_id, session.userId),
      eq(subscription.subscription_artist_id, artistId),
    )
  )

  return NextResponse.json({ ok: true })
}
