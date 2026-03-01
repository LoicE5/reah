import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { defis, videos, users } from '@/db/schema'
import { eq } from 'drizzle-orm'

type RouteParams = { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: RouteParams) {
  const { id } = await params
  const defiId = Number(id)
  if (isNaN(defiId)) return NextResponse.json({ error: 'ID invalide.' }, { status: 400 })

  const [defi] = await db.select().from(defis).where(eq(defis.defi_id, defiId)).limit(1)
  if (!defi) return NextResponse.json({ error: 'Défi introuvable.' }, { status: 404 })

  const defiVideos = await db
    .select({
      video_id:          videos.video_id,
      video_url:         videos.video_url,
      video_title:       videos.video_title,
      video_synopsis:    videos.video_synopsis,
      video_poster:      videos.video_poster,
      video_genre:       videos.video_genre,
      video_duration:    videos.video_duration,
      video_like_number: videos.video_like_number,
      video_date:        videos.video_date,
      video_user_id:     videos.video_user_id,
      user_username:     users.user_username,
      user_profile_picture: users.user_profile_picture,
    })
    .from(videos)
    .leftJoin(users, eq(users.user_id, videos.video_user_id))
    .where(eq(videos.video_defi_id, defiId))

  return NextResponse.json({ defi, videos: defiVideos })
}
