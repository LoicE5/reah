import { requireAuth } from '@/lib/session'
import { db } from '@/lib/db'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'
import { getSavedVideos, getLikedVideoIds } from '@/lib/queries'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import VideoCard from '@/components/VideoCard'
import '@/styles/saved.css'

export default async function SavedPage() {
    const session = await requireAuth()

    const [user] = await db
        .select({ pic: users.user_profile_picture })
        .from(users)
        .where(eq(users.user_id, session.userId))
        .limit(1)

    const savedVideos = await getSavedVideos(session.userId)
    const allIds = savedVideos.map(v => v.video_id)
    const likedSet = await getLikedVideoIds(session.userId, allIds)

    const enriched = savedVideos.map(v => ({
        ...v,
        isLiked: likedSet.has(v.video_id),
        isSaved: true,
    }))

    return (
        <main className="main_content">
            <Nav user={session} profilePic={user?.pic ?? ''} />

            <div className="saved_container" style={{ padding: '80px 5% 40px' }}>
                <h1 style={{ color: 'white' }}>Enregistrés</h1>
                <div className="film_container" style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginTop: 20 }}>
                    {enriched.length === 0 ? (
                        <p style={{ color: '#888' }}>Tu n&aposas pas encore enregistré de vidéo.</p>
                    ) : enriched.map(v => (
                        <VideoCard key={v.video_id} video={v} session={session} />
                    ))}
                </div>
            </div>

            <Footer />
        </main>
    )
}
