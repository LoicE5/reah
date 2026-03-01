import { getCurrentUser } from '@/lib/session'
import { getVerifiedDefis, getCurrentDefis } from '@/lib/queries'
import { db } from '@/lib/db'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import CountdownTimer from '@/components/CountdownTimer'
import AddDefiForm from './AddDefiForm'
import '@/styles/defis.css'

export default async function ChallengesPage({
    searchParams,
}: {
    searchParams: Promise<{ success?: string }>
}) {
    const session = await getCurrentUser()
    const resolvedParams = await searchParams

    let profilePic = ''
    if (session) {
        const [user] = await db
            .select({ pic: users.user_profile_picture })
            .from(users)
            .where(eq(users.user_id, session.userId))
            .limit(1)
        profilePic = user?.pic ?? ''
    }

    const [currentDefis, allDefis] = await Promise.all([
        getCurrentDefis(20),
        getVerifiedDefis(50)
    ])

    return (
        <main className="main_content">
            <Nav user={session} profilePic={profilePic} activeCategory={2} />

            {resolvedParams.success && <p className="message_true_container">Ton défi a été soumis et est en attente de validation.</p>}

            {/* Section 1: Défis du moment */}
            <div className="first_category">
                <div className="add_defi_btn_container">
                    <h1>Défis du moment</h1>
                    {session && (
                        <div className="add_defi_btn">
                            <AddDefiForm />
                        </div>
                    )}
                </div>

                {currentDefis.length === 0 ? (
                    <p style={{ color: '#888', padding: '40px 0 40px 150px' }}>Aucun défi du moment.</p>
                ) : (
                    <div className="defi_container">
                        {currentDefis.slice(0, 2).map(defi => (
                            <a key={defi.defi_id} href={`/challenges/${defi.defi_id}`} className="defi_content" style={{ textDecoration: 'none' }}>
                                {defi.defi_image ? (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img
                                        draggable={false}
                                        src={`/uploads/defis_img/${defi.defi_image}`}
                                        alt={defi.defi_name}
                                        className="defi_img"
                                    />
                                ) : (
                                    <div className="defi_img" style={{ background: '#1a1a1a' }} />
                                )}
                                <p className="defi_title">{defi.defi_name}</p>
                                {defi.defi_date_end && (
                                    <CountdownTimer endDate={defi.defi_date_end} className="defi_time" />
                                )}
                            </a>
                        ))}
                    </div>
                )}
            </div>

            {/* Section 2: À découvrir */}
            <div className="second_category">
                <h1 style={{ paddingLeft: '5%', marginBottom: 0 }}>À découvrir</h1>
                <div className="defi_pop_container">
                    {allDefis.map(defi => (
                        <a key={defi.defi_id} href={`/challenges/${defi.defi_id}`} className="defi_pop_content" style={{ textDecoration: 'none', flexShrink: 0 }}>
                            {defi.defi_image ? (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img
                                    draggable={false}
                                    src={`/uploads/defis_img/${defi.defi_image}`}
                                    alt={defi.defi_name}
                                    className="defi_pop_img"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                />
                            ) : (
                                <div style={{ width: '100%', height: '100%', background: '#1a1a1a' }} />
                            )}
                            <p className="defi_pop_title">{defi.defi_name}</p>
                            {defi.defi_date_end && (
                                <CountdownTimer endDate={defi.defi_date_end} className="defi_time" />
                            )}
                        </a>
                    ))}
                </div>
            </div>

            <Footer />
        </main>
    )
}
