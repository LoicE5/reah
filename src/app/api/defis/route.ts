import { NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { defis } from '@/db/schema'
import { eq, and } from 'drizzle-orm'
import { getCurrentUser } from '@/lib/session'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { randomUUID } from 'crypto'

export async function GET() {
  const rows = await db
    .select()
    .from(defis)
    .where(eq(defis.defi_verified, 1))
  return NextResponse.json(rows)
}

export async function POST(req: Request) {
  const session = await getCurrentUser()
  if (!session) return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 })

  const formData = await req.formData()
  const title       = formData.get('title') as string | null
  const description = formData.get('description') as string | null
  const imageFile   = formData.get('image') as File | null

  if (!title?.trim()) {
    return NextResponse.json({ error: 'Titre requis.' }, { status: 400 })
  }

  let imageFilename = ''
  if (imageFile && imageFile.size > 0) {
    const ext = imageFile.name.split('.').pop() ?? 'jpg'
    imageFilename = `${randomUUID()}.${ext}`
    const imagePath = join(process.cwd(), 'public/uploads/defis_img', imageFilename)
    await mkdir(join(process.cwd(), 'public/uploads/defis_img'), { recursive: true })
    await writeFile(imagePath, Buffer.from(await imageFile.arrayBuffer()))
  }

  const [result] = await db.insert(defis).values({
    defi_name:        title.trim(),
    defi_description: description ?? '',
    defi_image:       imageFilename,
    defi_user_id:     session.userId,
    defi_verified:    0,
    defi_current:     0,
  })

  return NextResponse.json({ ok: true, defi_id: Number(result.insertId) })
}
