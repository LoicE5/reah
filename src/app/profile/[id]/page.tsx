import { notFound } from 'next/navigation'
import { getCurrentUser } from '@/lib/session'
import { db } from '@/lib/db'
import { users, subscription } from '@/db/schema'
import { eq, count, and } from 'drizzle-orm'
import { getUserVideos, getLikedVideoIds, getSavedVideoIds } from '@/lib/queries'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import VideoCard from '@/components/VideoCard'
import SubscriptionButton from './SubscriptionButton'
import '@/styles/profil.css'

type PageProps = { params: Promise<{ id: string }> }

export default async function ProfilePage({ params }: PageProps) {
    const { id } = await params
    const session = await getCurrentUser()

    // Resolve "me" → actual user id
    const targetId = id === 'me' ? session?.userId : Number(id)
    if (!targetId || isNaN(targetId)) notFound()

    let navProfilePic = ''
    if (session) {
        const [u] = await db.select({ pic: users.user_profile_picture }).from(users).where(eq(users.user_id, session.userId)).limit(1)
        navProfilePic = u?.pic ?? ''
    }

    const [profileUser] = await db.select().from(users).where(eq(users.user_id, targetId)).limit(1)
    if (!profileUser) notFound()

    const [{ followerCount }] = await db.select({ followerCount: count() }).from(subscription).where(eq(subscription.subscription_artist_id, targetId))
    const [{ followingCount }] = await db.select({ followingCount: count() }).from(subscription).where(eq(subscription.subscription_subscriber_id, targetId))

    const profileVideos = await getUserVideos(targetId)
    const allIds = profileVideos.map(v => v.video_id)
    const likedSet = session ? await getLikedVideoIds(session.userId, allIds) : new Set<number>()
    const savedSet = session ? await getSavedVideoIds(session.userId) : new Set<number>()

    const enriched = profileVideos.map(v => ({ ...v, isLiked: likedSet.has(v.video_id), isSaved: savedSet.has(v.video_id) }))

    const isOwnProfile = session?.userId === targetId

    // Is current user subscribed to this profile?
    let isSubscribed = false
    if (session && !isOwnProfile) {
        const [sub] = await db
            .select()
            .from(subscription)
            .where(and(eq(subscription.subscription_subscriber_id, session.userId), eq(subscription.subscription_artist_id, targetId)))
            .limit(1)
        isSubscribed = !!sub
    }

    return (
        <main className="main_content">
            <Nav user={session} profilePic={navProfilePic} />

            {/* Banner */}
            <div className="banner_container">
                <div className="banner_flou_left" />
                {profileUser.user_banner ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={`/uploads/banners/${profileUser.user_banner}`} alt="" className="banner" />
                ) : (
                    <div className="banner" style={{ background: '#1a1a1a', width: '100%' }} />
                )}
                <div className="banner_flou_right" />
            </div>

            {/* Profile info row */}
            <div className="profile_container">
                <div className="profile_content1">
                    {/* Profile picture — positioned with top: -80px to overlap the banner */}
                    <div className="profile_photo">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={profileUser.user_profile_picture ? `/uploads/profile_pictures/${profileUser.user_profile_picture}` : '/sources/img/profile_icon.svg'}
                            alt={profileUser.user_username}
                            className="pp_profile"
                            style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                            onError={(e) => { (e.target as HTMLImageElement).src = '/sources/img/profile_icon.svg' }}
                        />
                    </div>
                    {isOwnProfile ? (
                        <a href="/settings" className="btn subscribe_btn">Modifier le profil</a>
                    ) : session ? (
                        <SubscriptionButton userId={targetId} initialSubscribed={isSubscribed} />
                    ) : null}
                </div>

                <div className="profile_content2 profile_bio_container">
                    <p className="profile_name">{profileUser.user_name || profileUser.user_username}</p>
                    <p className="profile_username">@{profileUser.user_username}</p>
                    {profileUser.user_bio && <p>{profileUser.user_bio}</p>}
                    {profileUser.user_website && (
                        <a href={profileUser.user_website} target="_blank" rel="noopener noreferrer" className="profile_website">
                            {profileUser.user_website}
                        </a>
                    )}
                </div>

                <div className="profile_subscription_container">
                    <div className="profile_subscription_content">
                        <p className="profile_subscription_number">{profileVideos.length}</p>
                        <p className="profile_subscription_title">Vidéos</p>
                    </div>
                    <div className="profile_subscription_content">
                        <p className="profile_subscription_number">{followerCount}</p>
                        <p className="profile_subscription_title">Abonnés</p>
                    </div>
                    <div className="profile_subscription_content">
                        <p className="profile_subscription_number">{followingCount}</p>
                        <p className="profile_subscription_title">Abonnements</p>
                    </div>
                </div>
            </div>

            {/* Videos */}
            <div className="realisation_number_container">
                <div className="realisation_number_content">
                    <p className="realisation_number_content_title realisation_number_content_title1">Réalisations</p>
                    <div className="red_line realisation_number_content_line realisation_number_content_line1" />
                </div>
            </div>

            <div className="all_realisation_container">
                <div className="realisation_container">
                    {enriched.length === 0 ? (
                        <p style={{ color: '#888' }}>Aucune vidéo pour l&aposinstant.</p>
                    ) : enriched.map(v => (
                        <VideoCard key={v.video_id} video={v} session={session} />
                    ))}
                </div>
            </div>

            <Footer />
        </main>
    )
}
