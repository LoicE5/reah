import { NextResponse } from 'next/server'
import { writeFile, unlink, mkdir } from 'fs/promises'
import { join } from 'path'
import { randomUUID } from 'crypto'
import { db } from '@/lib/db'
import { videos } from '@/db/schema'
import { getCurrentUser } from '@/lib/session'
import { uploadToVimeo } from '@/lib/vimeo'
import { validateImageUpload, UploadValidationError } from '@/lib/validateUpload'

// Allow up to 5 minutes for large video uploads
export const maxDuration = 300

export async function POST(req: Request) {
  const session = await getCurrentUser()
  if (!session) return NextResponse.json({ error: 'Non authentifié.' }, { status: 401 })

  const formData = await req.formData()

  const videoFile = formData.get('video') as File | null
  const posterFile = formData.get('poster') as File | null
  const title      = formData.get('title') as string | null
  const synopsis   = formData.get('synopsis') as string | null
  const genre      = formData.get('genre') as string | null
  const defiId     = formData.get('defi_id') as string | null

  if (!videoFile || !title) {
    return NextResponse.json({ error: 'Fichier vidéo et titre requis.' }, { status: 400 })
  }

  // Write video to temp file
  const tmpPath = join('/tmp', `reah_upload_${randomUUID()}.mp4`)
  try {
    const buf = await videoFile.arrayBuffer()
    await writeFile(tmpPath, Buffer.from(buf))
  } catch (error: unknown) {
    console.error('[videos/upload] Could not write temp file:', error)
    return NextResponse.json({ error: 'Erreur d\'enregistrement du fichier.' }, { status: 500 })
  }

  // Upload poster if provided
  let posterFilename = ''
  if (posterFile && posterFile.size > 0) {
    try {
      const { buffer, ext } = await validateImageUpload(posterFile)
      posterFilename = `${randomUUID()}.${ext}`
      const posterPath = join(process.cwd(), 'public/uploads/videos_posters', posterFilename)
      await mkdir(join(process.cwd(), 'public/uploads/videos_posters'), { recursive: true })
      await writeFile(posterPath, buffer)
    } catch (error: unknown) {
      if (error instanceof UploadValidationError) {
        await unlink(tmpPath).catch(() => {})
        return NextResponse.json({ error: error.message }, { status: 400 })
      }
      throw error
    }
  }

  // Upload to Vimeo
  let vimeoUri = ''
  try {
    vimeoUri = await uploadToVimeo(tmpPath, title, synopsis ?? '')
  } catch (error: unknown) {
    await unlink(tmpPath).catch((unlinkError: unknown) => { console.error('[videos/upload] Could not delete temp file:', unlinkError) })
    console.error('[videos/upload] Vimeo error:', error)
    return NextResponse.json({ error: 'Erreur lors de l\'upload Vimeo.' }, { status: 500 })
  } finally {
    await unlink(tmpPath).catch((unlinkError: unknown) => { console.error('[videos/upload] Could not delete temp file:', unlinkError) })
  }

  const vimeoId = vimeoUri.split('/videos/')[1] ?? vimeoUri

  await db.insert(videos).values({
    video_url:     vimeoId,
    video_vimeo_id: vimeoUri,
    video_title:   title,
    video_synopsis: synopsis ?? '',
    video_poster:  posterFilename,
    video_genre:   genre ?? '',
    video_user_id: session.userId,
    video_defi_id: defiId ? Number(defiId) : null
  })

  return NextResponse.json({ ok: true, vimeoId })
}
