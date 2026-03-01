import { getCurrentUser } from '@/lib/session'
import { db } from '@/lib/db'
import { users, videos, defis } from '@/db/schema'
import { like, eq } from 'drizzle-orm'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'

type PageProps = { searchParams: Promise<{ research?: string }> }

export default async function SearchPage({ searchParams }: PageProps) {
    const sp = await searchParams
    const query = sp.research?.trim() ?? ''
    const session = await getCurrentUser()

    let profilePic = ''
    if (session) {
        const [u] = await db.select({ pic: users.user_profile_picture }).from(users).where(eq(users.user_id, session.userId)).limit(1)
        profilePic = u?.pic ?? ''
    }

    const pattern = `%${query}%`

    const [videoResults, userResults, defiResults] = query
        ? await Promise.all([
            db
                .select({ video_id: videos.video_id, video_title: videos.video_title, video_poster: videos.video_poster, video_user_id: videos.video_user_id })
                .from(videos).where(like(videos.video_title, pattern)).limit(20),
            db
                .select({ user_id: users.user_id, user_username: users.user_username, user_profile_picture: users.user_profile_picture })
                .from(users).where(like(users.user_username, pattern)).limit(20),
            db
                .select({ defi_id: defis.defi_id, defi_name: defis.defi_name, defi_image: defis.defi_image })
                .from(defis).where(like(defis.defi_name, pattern)).limit(20),
        ])
        : [[], [], []]

    return (
        <main className="main_content">
            <Nav user={session} profilePic={profilePic} />

            <div style={{ padding: '80px 5% 40px' }}>
                <h1 style={{ color: 'white' }}>
                    {query ? `Résultats pour « ${query} »` : 'Recherche'}
                </h1>

                {query && videoResults.length === 0 && userResults.length === 0 && defiResults.length === 0 && (
                    <p style={{ color: '#888' }}>Aucun résultat trouvé.</p>
                )}

                {defiResults.length > 0 && (
                    <section style={{ marginTop: 30 }}>
                        <h2 style={{ color: '#d60036' }}>Défis</h2>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
                            {defiResults.map(d => (
                                <a key={d.defi_id} href={`/challenges/${d.defi_id}`} className="defi_box" style={{ textDecoration: 'none', width: 200 }}>
                                    {d.defi_image && (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img src={`/uploads/defis_img/${d.defi_image}`} alt={d.defi_name} style={{ width: '100%', height: 120, objectFit: 'cover' }} />
                                    )}
                                    <p style={{ color: 'white', padding: '8px 0', margin: 0 }}>{d.defi_name}</p>
                                </a>
                            ))}
                        </div>
                    </section>
                )}

                {userResults.length > 0 && (
                    <section style={{ marginTop: 30 }}>
                        <h2 style={{ color: '#d60036' }}>Utilisateurs</h2>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
                            {userResults.map(u => (
                                <a key={u.user_id} href={`/profile/${u.user_id}`} style={{ textDecoration: 'none', textAlign: 'center', width: 120 }}>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={u.user_profile_picture ? `/uploads/profile_pictures/${u.user_profile_picture}` : '/sources/img/profile_icon.svg'}
                                        alt={u.user_username}
                                        style={{ height: 64, width: 64, borderRadius: '50%', objectFit: 'cover', display: 'block', margin: '0 auto 8px' }}
                                    />
                                    <span style={{ color: 'white', fontSize: '0.9em' }}>@{u.user_username}</span>
                                </a>
                            ))}
                        </div>
                    </section>
                )}

                {videoResults.length > 0 && (
                    <section style={{ marginTop: 30 }}>
                        <h2 style={{ color: '#d60036' }}>Vidéos</h2>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
                            {videoResults.map(v => (
                                <a key={v.video_id} href={`/feed?video=${v.video_id}`} style={{ textDecoration: 'none', width: 200 }}>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                        src={`/uploads/videos_posters/${v.video_poster || 'default.jpg'}`}
                                        alt={v.video_title ?? ''}
                                        style={{ width: '100%', height: 120, objectFit: 'cover' }}
                                    />
                                    <p style={{ color: 'white', padding: '6px 0', margin: 0, fontSize: '0.9em' }}>{v.video_title}</p>
                                </a>
                            ))}
                        </div>
                    </section>
                )}
            </div>

            <Footer />
        </main>
    )
}
