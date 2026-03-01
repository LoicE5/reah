import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { videos, users, defis } from '@/db/schema'
import { like, eq } from 'drizzle-orm'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')?.trim() ?? ''

  if (!q) {
    return NextResponse.json({ videos: [], users: [], defis: [] })
  }

  const pattern = `%${q}%`

  const [videoResults, userResults, defiResults] = await Promise.all([
    db
      .select({
        video_id:     videos.video_id,
        video_title:  videos.video_title,
        video_poster: videos.video_poster,
        video_url:    videos.video_url,
      })
      .from(videos)
      .where(like(videos.video_title, pattern))
      .limit(10),

    db
      .select({
        user_id:              users.user_id,
        user_username:        users.user_username,
        user_profile_picture: users.user_profile_picture,
      })
      .from(users)
      .where(like(users.user_username, pattern))
      .limit(10),

    db
      .select({
        defi_id:    defis.defi_id,
        defi_name:  defis.defi_name,
        defi_image: defis.defi_image,
      })
      .from(defis)
      .where(like(defis.defi_name, pattern))
      .limit(10),
  ])

  return NextResponse.json({
    videos: videoResults,
    users:  userResults,
    defis:  defiResults,
  })
}
