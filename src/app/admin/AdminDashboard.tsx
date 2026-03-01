'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface AdminUser {
    user_id: number
    user_lastname: string | null
    user_firstname: string | null
    user_username: string
    user_email: string
    user_birthday: string | null
    user_suspended: number | null
}

interface AdminVideo {
    video_id: number
    video_url: string | null
    video_title: string | null
    user_username: string | null
    video_synopsis: string | null
    video_genre: string | null
    defi_name: string | null
    video_date: string | null
    video_like_number: number | null
}

interface AdminDefi {
    defi_id: number
    defi_name: string
    defi_description: string | null
    defi_timestamp: string | null
    defi_date_end: string | null
    user_username: string | null
    defi_verified: number | null
    defi_current: number | null
}

interface AdminComment {
    comment_id: number
    comment_content: string
    comment_date: string | null
    video_title: string | null
    user_username: string | null
}

interface Props {
    users: AdminUser[]
    videos: AdminVideo[]
    defis: AdminDefi[]
    comments: AdminComment[]
}

export default function AdminDashboard({ users, videos, defis, comments }: Props) {
    const router = useRouter()
    const [loading, setLoading] = useState<string | null>(null)
    const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)

    async function call(url: string, method: string) {
        setLoading(url)
        setMessage(null)
        try {
            const res = await fetch(url, { method })
            const data = await res.json()
            if (res.ok) {
                setMessage({ ok: true, text: 'Action effectuée.' })
                router.refresh()
            } else {
                setMessage({ ok: false, text: data.error ?? 'Erreur.' })
            }
        } catch (error: unknown) {
            console.error(error)
            setMessage({ ok: false, text: 'Erreur réseau.' })
        } finally {
            setLoading(null)
        }
    }

    function confirmDelete(label: string, onConfirm: () => void) {
        if (window.confirm(`Supprimer ${label} ? Cette action est irréversible.`)) {
            onConfirm()
        }
    }

    return (
        <div style={{ padding: '20px 0' }}>
            {message && (
                <p className={message.ok ? 'message_true_container' : 'message_false_container'}
                    style={{ position: 'fixed', top: 80, right: 20, zIndex: 9999 }}>
                    {message.text}
                </p>
            )}

            {/* ---- USERS ---- */}
            <h1 className="title1" id="title1">
                <div className="red_line title_line" />
                UTILISATEURS ({users.length})
            </h1>
            <div style={{ overflowX: 'auto' }}>
                <table>
                    <thead>
                        <tr>
                            <th>ID</th><th>Nom</th><th>Prénom</th><th>Pseudo</th>
                            <th>Email</th><th>Anniv.</th><th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map(adminUser => (
                            <tr key={adminUser.user_id}>
                                <td>{adminUser.user_id}</td>
                                <td>{adminUser.user_lastname}</td>
                                <td>{adminUser.user_firstname}</td>
                                <td><a href={`/profile/${adminUser.user_id}`}>{adminUser.user_username}</a></td>
                                <td>{adminUser.user_email}</td>
                                <td>{adminUser.user_birthday}</td>
                                <td style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                    <button
                                        className={adminUser.user_suspended ? 'action_suspend_true' : 'action_suspend'}
                                        disabled={loading === `/api/admin/users/${adminUser.user_id}/suspend`}
                                        onClick={() => call(`/api/admin/users/${adminUser.user_id}/suspend`, 'POST')}
                                    >
                                        {adminUser.user_suspended ? 'Désuspendre' : 'Suspendre'}
                                    </button>
                                    <button
                                        className="action_delete"
                                        disabled={loading === `/api/admin/users/${adminUser.user_id}`}
                                        onClick={() => confirmDelete(adminUser.user_username, () => call(`/api/admin/users/${adminUser.user_id}`, 'DELETE'))}
                                    >
                                        Supprimer
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* ---- VIDEOS ---- */}
            <h1 className="title2" id="title2" style={{ marginTop: 40 }}>
                <div className="red_line title_line" />
                COURTS-MÉTRAGES ({videos.length})
            </h1>
            <div style={{ overflowX: 'auto' }}>
                <table>
                    <thead>
                        <tr>
                            <th>ID</th><th>URL</th><th>Titre</th><th>Réalisateur</th>
                            <th>Genre</th><th>Défi</th><th>Date</th><th>Likes</th><th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {videos.map(video => (
                            <tr key={video.video_id}>
                                <td>{video.video_id}</td>
                                <td>
                                    {video.video_url && (
                                        <a href={`https://player.vimeo.com/video/${video.video_url}`} target="_blank" rel="noreferrer">
                                            {video.video_url}
                                        </a>
                                    )}
                                </td>
                                <td>{video.video_title}</td>
                                <td>{video.user_username}</td>
                                <td>{video.video_genre}</td>
                                <td>{video.defi_name}</td>
                                <td>{video.video_date ? new Date(video.video_date).toLocaleDateString('fr-FR') : ''}</td>
                                <td>{video.video_like_number}</td>
                                <td>
                                    <button
                                        className="action_delete"
                                        disabled={loading === `/api/admin/videos/${video.video_id}`}
                                        onClick={() => confirmDelete(video.video_title ?? String(video.video_id), () => call(`/api/admin/videos/${video.video_id}`, 'DELETE'))}
                                    >
                                        Supprimer
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* ---- DEFIS ---- */}
            <h1 className="title3" id="title3" style={{ marginTop: 40 }}>
                <div className="red_line title_line" />
                DÉFIS ({defis.length})
            </h1>
            <div style={{ overflowX: 'auto' }}>
                <table>
                    <thead>
                        <tr>
                            <th>ID</th><th>Titre</th><th>Date</th><th>Date fin</th>
                            <th>Utilisateur</th><th>Validé</th><th>Du moment</th><th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {defis.map(defi => (
                            <tr key={defi.defi_id}>
                                <td>{defi.defi_id}</td>
                                <td>{defi.defi_name}</td>
                                <td>{defi.defi_timestamp ? new Date(defi.defi_timestamp).toLocaleDateString('fr-FR') : ''}</td>
                                <td>{defi.defi_date_end ? new Date(defi.defi_date_end).toLocaleDateString('fr-FR') : '—'}</td>
                                <td>{defi.user_username}</td>
                                <td>{defi.defi_verified ? 'Oui' : 'Non'}</td>
                                <td>{defi.defi_current ? 'Oui' : 'Non'}</td>
                                <td style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                    <button
                                        className={defi.defi_verified ? 'action_suspend_true' : 'action_suspend'}
                                        disabled={loading === `patch-verified-${defi.defi_id}`}
                                        onClick={async () => {
                                            setLoading(`patch-verified-${defi.defi_id}`)
                                            await fetch(`/api/admin/defis/${defi.defi_id}`, {
                                                method: 'PATCH',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify({ verified: defi.defi_verified ? 0 : 1 }),
                                            })
                                            setLoading(null)
                                            router.refresh()
                                        }}
                                    >
                                        {defi.defi_verified ? 'Dévalider' : 'Valider'}
                                    </button>
                                    <button
                                        className={defi.defi_current ? 'action_suspend_true' : 'action_suspend'}
                                        disabled={loading === `patch-current-${defi.defi_id}`}
                                        onClick={async () => {
                                            setLoading(`patch-current-${defi.defi_id}`)
                                            const body: Record<string, unknown> = { current: defi.defi_current ? 0 : 1 }
                                            if (!defi.defi_current) {
                                                // Setting to current: set end date to +1 month
                                                const end = new Date()
                                                end.setMonth(end.getMonth() + 1)
                                                body.date_end = end.toISOString().slice(0, 10)
                                            }
                                            await fetch(`/api/admin/defis/${defi.defi_id}`, {
                                                method: 'PATCH',
                                                headers: { 'Content-Type': 'application/json' },
                                                body: JSON.stringify(body),
                                            })
                                            setLoading(null)
                                            router.refresh()
                                        }}
                                    >
                                        {defi.defi_current ? 'Retirer' : 'Mettre actuel'}
                                    </button>
                                    <button
                                        className="action_delete"
                                        disabled={loading === `/api/admin/defis/${defi.defi_id}`}
                                        onClick={() => confirmDelete(defi.defi_name, () => call(`/api/admin/defis/${defi.defi_id}`, 'DELETE'))}
                                    >
                                        Supprimer
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* ---- COMMENTS ---- */}
            <h1 className="title4" id="title4" style={{ marginTop: 40 }}>
                <div className="red_line title_line" />
                COMMENTAIRES ({comments.length})
            </h1>
            <div style={{ overflowX: 'auto' }}>
                <table>
                    <thead>
                        <tr>
                            <th>ID</th><th>Court-métrage</th><th>Date</th>
                            <th>Contenu</th><th>Utilisateur</th><th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {comments.map(comment => (
                            <tr key={comment.comment_id}>
                                <td>{comment.comment_id}</td>
                                <td>{comment.video_title}</td>
                                <td>{comment.comment_date ? new Date(comment.comment_date).toLocaleDateString('fr-FR') : ''}</td>
                                <td>{comment.comment_content}</td>
                                <td>{comment.user_username}</td>
                                <td>
                                    <button
                                        className="action_delete"
                                        disabled={loading === `comment-${comment.comment_id}`}
                                        onClick={async () => {
                                            setLoading(`comment-${comment.comment_id}`)
                                            // We need video_id to call the API, but comments table doesn't have it directly in this view
                                            // Use admin-specific delete repurpose the user's comment delete route
                                            // Actually we need to find the video_id — let's just call the admin route
                                            await fetch(`/api/admin/comments/${comment.comment_id}`, { method: 'DELETE' })
                                            setLoading(null)
                                            router.refresh()
                                        }}
                                    >
                                        Supprimer
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
