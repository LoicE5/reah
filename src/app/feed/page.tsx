import { getCurrentUser } from '@/lib/session'
import { db } from '@/lib/db'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'
import {
    getSubscribedFeed, getLatestVideos, getExploreVideos,
    getCurrentDefis, getLikedVideoIds, getSavedVideoIds,
} from '@/lib/queries'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import VideoCard from '@/components/VideoCard'
import CategoryTabs from '@/components/CategoryTabs'
import CountdownTimer from '@/components/CountdownTimer'
import '@/styles/fil_actu2.css'
import '@/styles/defis.css'

export default async function FeedPage({
    searchParams,
}: {
        searchParams: Promise<{ accueil?: string, tab?: string }>
}) {
    const session = await getCurrentUser()
    const sp = await searchParams
    const showLanding = !session && !sp.accueil
    const initialTab = (sp.tab === '2' ? 2 : sp.tab === '3' ? 3 : 1) as 1 | 2 | 3

    // Fetch profile picture for nav
    let profilePic = ''
    let dbError = false

    if (session) {
        try {
            const [user] = await db
                .select({ pic: users.user_profile_picture })
                .from(users)
                .where(eq(users.user_id, session.userId))
                .limit(1)
            profilePic = user?.pic ?? ''
        } catch { dbError = true }
    }

    // 3 parallel queries
    let feedVideos: Awaited<ReturnType<typeof getLatestVideos>> = []
    let currentDefis: Awaited<ReturnType<typeof getCurrentDefis>> = []
    let exploreVideos: Awaited<ReturnType<typeof getExploreVideos>> = []

    if (!dbError) {
        try {
            [feedVideos, currentDefis, exploreVideos] = await Promise.all([
                session ? getSubscribedFeed(session.userId) : getLatestVideos(),
                getCurrentDefis(10),
                getExploreVideos(20),
            ])
        } catch { dbError = true }
    }

    // Liked / saved state
    let likedSet = new Set<number>()
    let savedSet = new Set<number>()
    if (!dbError && session) {
        try {
            const allIds = [...new Set([...feedVideos, ...exploreVideos].map(v => v.video_id))]
            [likedSet, savedSet] = await Promise.all([
                getLikedVideoIds(session.userId, allIds),
                getSavedVideoIds(session.userId),
            ])
        } catch { /* non-critical */ }
    }

    function enrichVideos(vids: typeof feedVideos) {
        return vids.map(v => ({
            ...v,
            isLiked: likedSet.has(v.video_id),
            isSaved: savedSet.has(v.video_id),
        }))
    }

    const enrichedFeed = enrichVideos(feedVideos)
    const enrichedExplore = enrichVideos(exploreVideos)

    const dbOfflineBanner = dbError ? (
        <p style={{ textAlign: 'center', color: '#888', padding: '40px 0' }}>
            La base de données est actuellement hors ligne. Veuillez réessayer dans quelques instants.
        </p>
    ) : null

    return (
        <>
            {/* Guest landing hero — mirrors the <section class="accueil"> in fil_actu.php */}
            {showLanding && (
                <section className="accueil" id="accueil">
                    <a className="accueil_reah_logo" href="/feed" />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img draggable={false} src="/sources/img/accueil_img.png" className="accueil_img" alt="" />
                    <div className="accueil_text">
                        <p className="h1"><span>R</span>EAH</p>
                        <p>
                            Stimule ton esprit créatif en participant aux défis avec tes{' '}
                            <span style={{ whiteSpace: 'nowrap' }}>courts-métrages.</span>{' '}
                            <br />Tente ta chance de te faire connaître ou contribue au succès des autres.<br /><br />
                            <b>Réalisateurs, amateurs ou <span style={{ whiteSpace: 'nowrap' }}>débutants ?</span><br />
                                À vos marques, prêt·e·s, <span>tournez !</span></b>
                        </p>
                        <div className="btn_container">
                            <a href="/login" className="btn btn_connexion">Se connecter</a>
                            <a href="/signup" className="btn btn_connexion">S&aposinscrire</a>
                        </div>
                    </div>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img draggable={false} src="/sources/img/accueil_arrow.svg" className="scroll_arrow" alt="" />
                </section>
            )}

            <main className="main_content">
                <Nav user={session} profilePic={profilePic} activeCategory={initialTab} />

                {/* Mobile footer nav */}
                <div className="nav_footer">
                    <div className="nav_footer_category">
                        <div className="nouveaute_icon" />
                        {session ? "Fil d'actualité" : 'Nouveautés'}
                    </div>
                    <div className="nav_footer_category">
                        <div className="defi_constraints_icon" />
                        Défis du moment
                    </div>
                    <div className="nav_footer_category">
                        <div className="explorer_icon" />
                        Explorer
                    </div>
                </div>

                <CategoryTabs
                    key={initialTab}
                    isLoggedIn={!!session}
                    initialTab={initialTab}
                    tab1Content={
                        <div className="first_category" id="category">
                            <div className="category_content">
                                <h1 id="title1">
                                    <div className="red_line title_line" />
                                    {session ? "FIL D'ACTUALITÉ" : 'NOUVEAUTÉS'}
                                </h1>
                                <div className="all_video_container" id="all_video_container">
                                    {dbOfflineBanner ?? (enrichedFeed.length === 0 ? (
                                        <p style={{ color: '#888', padding: '40px 20px' }}>
                                            {session ? 'Abonne-toi à des réalisateurs pour voir leurs vidéos ici.' : 'Aucune vidéo pour l\'instant.'}
                                        </p>
                                    ) : enrichedFeed.map(v => (
                                        <VideoCard key={v.video_id} video={v} session={session} />
                                    )))}
                                </div>
                            </div>
                        </div>
                    }
                    tab2Content={
                        <div className="second_category" id="category2">
                            <div className="category_content">
                                <h1 id="title2">
                                    <div className="red_line title_line" />
                                    DÉFIS DU MOMENT
                                </h1>
                                <div className="defi_container">
                                    {dbOfflineBanner ?? (currentDefis.length === 0 ? (
                                        <p style={{ color: '#888', padding: '40px 20px' }}>Aucun défi du moment.</p>
                                    ) : currentDefis.map(defi => (
                                        <a key={defi.defi_id} href={`/challenges/${defi.defi_id}`} className="defi_box" style={{ textDecoration: 'none' }}>
                                            {defi.defi_image && (
                                                // eslint-disable-next-line @next/next/no-img-element
                                                <img draggable={false} src={`/uploads/defis_img/${defi.defi_image}`} alt={defi.defi_name} className="defi_img" />
                                            )}
                                            <div className="defi_info">
                                                <p className="defi_title">{defi.defi_name}</p>
                                                {defi.defi_date_end && (
                                                    <CountdownTimer endDate={defi.defi_date_end} className="defi_timer" />
                                                )}
                                            </div>
                                        </a>
                                    )))}
                                </div>
                            </div>
                        </div>
                    }
                    tab3Content={
                        <div className="third_category" id="category3">
                            <div className="category_content">
                                <h1 id="title3">
                                    <div className="red_line title_line" />
                                    EXPLORER
                                </h1>
                                <div className="all_video_container">
                                    {dbOfflineBanner ?? enrichedExplore.map(v => (
                                        <VideoCard key={v.video_id} video={v} session={session} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    }
                />

                <Footer />
            </main>
        </>
    )
}
