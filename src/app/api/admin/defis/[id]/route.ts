import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { defis } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { getCurrentUser } from '@/lib/session'

type RouteParams = { params: Promise<{ id: string }> }

const patchSchema = z.object({
  verified:  z.number().int().min(0).max(1).optional(),
  current:   z.number().int().min(0).max(1).optional(),
  date_end:  z.string().optional(),
  name:      z.string().optional(),
  description: z.string().optional(),
})

export async function PATCH(req: Request, { params }: RouteParams) {
  const session = await getCurrentUser()
  if (!session?.isAdmin) return NextResponse.json({ error: 'Non autorisé.' }, { status: 403 })

  const { id } = await params
  const defiId = Number(id)
  const body = await req.json()
  const parsed = patchSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: 'Données invalides.' }, { status: 400 })

  const updates: Record<string, unknown> = {}
  if (parsed.data.verified  !== undefined) updates.defi_verified    = parsed.data.verified
  if (parsed.data.current   !== undefined) updates.defi_current     = parsed.data.current
  if (parsed.data.date_end  !== undefined) updates.defi_date_end    = parsed.data.date_end
  if (parsed.data.name      !== undefined) updates.defi_name        = parsed.data.name
  if (parsed.data.description !== undefined) updates.defi_description = parsed.data.description

  if (Object.keys(updates).length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await db.update(defis).set(updates as any).where(eq(defis.defi_id, defiId))
  }

  return NextResponse.json({ ok: true })
}

export async function DELETE(_req: Request, { params }: RouteParams) {
  const session = await getCurrentUser()
  if (!session?.isAdmin) return NextResponse.json({ error: 'Non autorisé.' }, { status: 403 })

  const { id } = await params
  const defiId = Number(id)

  await db.delete(defis).where(eq(defis.defi_id, defiId))
  return NextResponse.json({ ok: true })
}
