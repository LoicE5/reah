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
    const [profileMessage, setProfileMessage] = useState<{ ok: boolean; text: string } | null>(null)
    const [passwordMessage, setPasswordMessage] = useState<{ ok: boolean; text: string } | null>(null)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

    async function saveProfile(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        setProfileLoading(true)
        setProfileMessage(null)
        const formData = new FormData()
        formData.set('name', name)
        formData.set('username', username)
        formData.set('bio', bio)
        formData.set('website', website)
        if (avatar) formData.set('avatar', avatar)
        if (banner) formData.set('banner', banner)
        try {
            const res = await fetch('/api/users/me', { method: 'PATCH', body: formData })
            if (res.ok) {
                setProfileMessage({ ok: true, text: 'Profil mis à jour !' })
                router.refresh()
            } else {
                const data = await res.json()
                setProfileMessage({ ok: false, text: data.error ?? 'Erreur.' })
            }
        } catch (error: unknown) {
            setProfileMessage({ ok: false, text: 'Erreur réseau.' })
        } finally {
            setProfileLoading(false)
        }
    }

    async function changePassword(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        if (newPassword !== confirmPassword) {
            setPasswordMessage({ ok: false, text: 'Les mots de passe ne correspondent pas.' })
            return
        }
        setPasswordLoading(true)
        setPasswordMessage(null)
        try {
            const res = await fetch('/api/auth/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mode: 'change', prevPassword, newPassword }),
            })
            const data = await res.json()
            if (res.ok) {
                setPasswordMessage({ ok: true, text: 'Mot de passe modifié !' })
                setPrevPassword('')
                setNewPassword('')
                setConfirmPassword('')
            } else {
                setPasswordMessage({ ok: false, text: data.error ?? 'Erreur.' })
            }
        } catch (error: unknown) {
            setPasswordMessage({ ok: false, text: 'Erreur réseau.' })
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
        } catch (error: unknown) { console.error(error) }
        finally { setDeleteLoading(false) }
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
            {/* Profile section */}
            <section>
                <h2 style={{ color: '#d60036', borderBottom: '1px solid #333', paddingBottom: 10 }}>Profil</h2>
                {profileMessage && (
                    <p className={profileMessage.ok ? 'message_true_container' : 'message_false_container'}
                        style={{ position: 'static', animation: 'none', marginBottom: 16 }}>
                        {profileMessage.text}
                    </p>
                )}
                <form onSubmit={saveProfile} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div className="input_container">
                        <label><span>Nom d'affichage</span>
                            <input className="input_connexion" value={name} onChange={event => setName(event.target.value)} />
                        </label>
                    </div>
                    <div className="input_container">
                        <label><span>Pseudo</span>
                            <input className="input_connexion" value={username} onChange={event => setUsername(event.target.value)} />
                        </label>
                    </div>
                    <div className="input_container">
                        <label><span>Bio</span>
                            <textarea style={{ background: 'transparent', border: 'none', borderBottom: '1px solid white', color: 'white', width: '100%', minHeight: 60, fontFamily: 'inherit' }}
                                value={bio} onChange={event => setBio(event.target.value)} />
                        </label>
                    </div>
                    <div className="input_container">
                        <label><span>Site web</span>
                            <input className="input_connexion" type="url" value={website} onChange={event => setWebsite(event.target.value)} />
                        </label>
                    </div>
                    <div className="input_container">
                        <span>Photo de profil</span>
                        <input type="file" accept="image/*" style={{ color: 'white', marginTop: 8 }} onChange={event => setAvatar(event.target.files?.[0] ?? null)} />
                    </div>
                    <div className="input_container">
                        <span>Bannière</span>
                        <input type="file" accept="image/*" style={{ color: 'white', marginTop: 8 }} onChange={event => setBanner(event.target.files?.[0] ?? null)} />
                    </div>
                    <button type="submit" className="btn" disabled={profileLoading}>{profileLoading ? 'Enregistrement...' : 'Enregistrer'}</button>
                </form>
            </section>

            {/* Password section */}
            <section>
                <h2 style={{ color: '#d60036', borderBottom: '1px solid #333', paddingBottom: 10 }}>Mot de passe</h2>
                {passwordMessage && (
                    <p className={passwordMessage.ok ? 'message_true_container' : 'message_false_container'}
                        style={{ position: 'static', animation: 'none', marginBottom: 16 }}>
                        {passwordMessage.text}
                    </p>
                )}
                <form onSubmit={changePassword} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div className="input_container">
                        <label><span>Mot de passe actuel</span>
                            <input className="input_connexion" type="password" value={prevPassword} onChange={event => setPrevPassword(event.target.value)} required />
                        </label>
                    </div>
                    <div className="input_container">
                        <label><span>Nouveau mot de passe</span>
                            <input className="input_connexion" type="password" value={newPassword} onChange={event => setNewPassword(event.target.value)} required minLength={8} />
                        </label>
                        <p className="mdp_restriction">8 caractères min. • 1 majuscule • 1 minuscule</p>
                    </div>
                    <div className="input_container">
                        <label><span>Confirmer</span>
                            <input className="input_connexion" type="password" value={confirmPassword} onChange={event => setConfirmPassword(event.target.value)} required />
                        </label>
                    </div>
                    <button type="submit" className="btn change_mdp_btn" disabled={passwordLoading}>{passwordLoading ? '...' : 'Modifier le mot de passe'}</button>
                </form>
            </section>

            {/* Danger zone */}
            <section>
                <h2 style={{ color: '#d60036', borderBottom: '1px solid #333', paddingBottom: 10 }}>Zone de danger</h2>
                {!showDeleteConfirm ? (
                    <button className="btn" style={{ background: 'transparent', border: '1px solid #d60036', width: 'auto', padding: '0 16px' }} onClick={() => setShowDeleteConfirm(true)}>
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
