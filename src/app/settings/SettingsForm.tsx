'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface UserData {
    user_id: number
    user_username: string
    user_name: string
    user_bio: string
    user_website: string
    user_profile_picture: string
    user_banner: string
}

export default function SettingsForm({ user }: { user: UserData }) {
    const router = useRouter()

    const [name, setName] = useState(user.user_name)
    const [username, setUsername] = useState(user.user_username)
    const [bio, setBio] = useState(user.user_bio)
    const [website, setWebsite] = useState(user.user_website)
    const [avatar, setAvatar] = useState<File | null>(null)
    const [banner, setBanner] = useState<File | null>(null)

    const [prevPassword, setPrevPassword] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    const [profileLoading, setProfileLoading] = useState(false)
    const [passwordLoading, setPasswordLoading] = useState(false)
    const [deleteLoading, setDeleteLoading] = useState(false)
    const [profileMsg, setProfileMsg] = useState<{ ok: boolean, text: string } | null>(null)
    const [passwordMsg, setPasswordMsg] = useState<{ ok: boolean, text: string } | null>(null)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

    async function saveProfile(e: React.FormEvent) {
        e.preventDefault()
        setProfileLoading(true)
        setProfileMsg(null)
        const fd = new FormData()
        fd.set('name', name)
        fd.set('username', username)
        fd.set('bio', bio)
        fd.set('website', website)
        if (avatar) fd.set('avatar', avatar)
        if (banner) fd.set('banner', banner)
        try {
            const res = await fetch('/api/users/me', { method: 'PATCH', body: fd })
            if (res.ok) {
                setProfileMsg({ ok: true, text: 'Profil mis à jour !' })
                router.refresh()
            } else {
                const d = await res.json()
                setProfileMsg({ ok: false, text: d.error ?? 'Erreur.' })
            }
        } catch {
            setProfileMsg({ ok: false, text: 'Erreur réseau.' })
        } finally {
            setProfileLoading(false)
        }
    }

    async function changePassword(e: React.FormEvent) {
        e.preventDefault()
        if (newPassword !== confirmPassword) {
            setPasswordMsg({ ok: false, text: 'Les mots de passe ne correspondent pas.' })
            return
        }
        setPasswordLoading(true)
        setPasswordMsg(null)
        try {
            const res = await fetch('/api/auth/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mode: 'change', prevPassword, newPassword }),
            })
            const d = await res.json()
            if (res.ok) {
                setPasswordMsg({ ok: true, text: 'Mot de passe modifié !' })
                setPrevPassword('')
                setNewPassword('')
                setConfirmPassword('')
            } else {
                setPasswordMsg({ ok: false, text: d.error ?? 'Erreur.' })
            }
        } catch {
            setPasswordMsg({ ok: false, text: 'Erreur réseau.' })
        } finally {
            setPasswordLoading(false)
        }
    }

    async function deleteAccount() {
        setDeleteLoading(true)
        try {
            const res = await fetch('/api/users/me', { method: 'DELETE' })
            if (res.ok) {
                router.push('/feed?delete_account=true')
            }
        } catch { /* fail silently */ }
        finally { setDeleteLoading(false) }
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
            {/* Profile section */}
            <section>
                <h2 style={{ color: '#d60036', borderBottom: '1px solid #333', paddingBottom: 10 }}>Profil</h2>
                {profileMsg && (
                    <p className={profileMsg.ok ? 'message_true_container' : 'message_false_container'}
                        style={{ position: 'static', animation: 'none', marginBottom: 16 }}>
                        {profileMsg.text}
                    </p>
                )}
                <form onSubmit={saveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div className="input_container">
                        <label><span>Nom d&aposaffichage</span>
                            <input className="input_connexion" value={name} onChange={e => setName(e.target.value)} />
                        </label>
                    </div>
                    <div className="input_container">
                        <label><span>Pseudo</span>
                            <input className="input_connexion" value={username} onChange={e => setUsername(e.target.value)} />
                        </label>
                    </div>
                    <div className="input_container">
                        <label><span>Bio</span>
                            <textarea style={{ background: 'transparent', border: 'none', borderBottom: '1px solid white', color: 'white', width: '100%', minHeight: 60, fontFamily: 'inherit' }}
                                value={bio} onChange={e => setBio(e.target.value)} />
                        </label>
                    </div>
                    <div className="input_container">
                        <label><span>Site web</span>
                            <input className="input_connexion" type="url" value={website} onChange={e => setWebsite(e.target.value)} />
                        </label>
                    </div>
                    <div className="input_container">
                        <span>Photo de profil</span>
                        <input type="file" accept="image/*" style={{ color: 'white', marginTop: 8 }} onChange={e => setAvatar(e.target.files?.[0] ?? null)} />
                    </div>
                    <div className="input_container">
                        <span>Bannière</span>
                        <input type="file" accept="image/*" style={{ color: 'white', marginTop: 8 }} onChange={e => setBanner(e.target.files?.[0] ?? null)} />
                    </div>
                    <button type="submit" className="btn" disabled={profileLoading}>{profileLoading ? 'Enregistrement...' : 'Enregistrer'}</button>
                </form>
            </section>

            {/* Password section */}
            <section>
                <h2 style={{ color: '#d60036', borderBottom: '1px solid #333', paddingBottom: 10 }}>Mot de passe</h2>
                {passwordMsg && (
                    <p className={passwordMsg.ok ? 'message_true_container' : 'message_false_container'}
                        style={{ position: 'static', animation: 'none', marginBottom: 16 }}>
                        {passwordMsg.text}
                    </p>
                )}
                <form onSubmit={changePassword} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div className="input_container">
                        <label><span>Mot de passe actuel</span>
                            <input className="input_connexion" type="password" value={prevPassword} onChange={e => setPrevPassword(e.target.value)} required />
                        </label>
                    </div>
                    <div className="input_container">
                        <label><span>Nouveau mot de passe</span>
                            <input className="input_connexion" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={8} />
                        </label>
                        <p className="mdp_restriction">8 caractères min. • 1 majuscule • 1 minuscule</p>
                    </div>
                    <div className="input_container">
                        <label><span>Confirmer</span>
                            <input className="input_connexion" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
                        </label>
                    </div>
                    <button type="submit" className="btn" disabled={passwordLoading}>{passwordLoading ? '...' : 'Modifier le mot de passe'}</button>
                </form>
            </section>

            {/* Danger zone */}
            <section>
                <h2 style={{ color: '#d60036', borderBottom: '1px solid #333', paddingBottom: 10 }}>Zone de danger</h2>
                {!showDeleteConfirm ? (
                    <button className="btn" style={{ background: 'transparent', border: '1px solid #d60036' }} onClick={() => setShowDeleteConfirm(true)}>
                        Supprimer mon compte
                    </button>
                ) : (
                    <div className="delete_account_container" style={{ display: 'flex', flexDirection: 'column', gap: 12, border: '1px solid #d60036', padding: 20 }}>
                        <p style={{ color: 'white' }}>⚠️ Cette action est irréversible. Toutes tes vidéos, commentaires et données seront supprimés.</p>
                        <div style={{ display: 'flex', gap: 16 }}>
                            <button className="btn" onClick={deleteAccount} disabled={deleteLoading}>{deleteLoading ? '...' : 'Confirmer la suppression'}</button>
                            <button className="btn" style={{ background: 'transparent', border: '1px solid white' }} onClick={() => setShowDeleteConfirm(false)}>Annuler</button>
                        </div>
                    </div>
                )}
            </section>
        </div>
    )
}
