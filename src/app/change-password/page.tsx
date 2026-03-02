'use client'

import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import '@/styles/mdp_chgmt.css'
import '@/styles/connexion.css'

function ChangePasswordForm() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const email = searchParams.get('email') ?? ''

    const [newPassword, setNewPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)

    if (!email) {
        return (
            <p className="message_false_container">
                Lien invalide. <a href="/forgot-password">Recommencer</a>
            </p>
        )
    }

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        if (newPassword !== confirmPassword) {
            setMessage({ ok: false, text: 'Les mots de passe ne correspondent pas.' })
            return
        }
        setLoading(true)
        setMessage(null)
        try {
            const res = await fetch('/api/auth/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mode: 'reset', email, newPassword }),
            })
            const data = await res.json()
            if (res.ok) {
                setMessage({ ok: true, text: 'Mot de passe modifié ! Redirection...' })
                setTimeout(() => router.push('/login'), 1500)
            } else {
                setMessage({ ok: false, text: data.error ?? 'Erreur.' })
            }
        } catch (error: unknown) {
            setMessage({ ok: false, text: 'Erreur réseau.' })
        } finally {
            setLoading(false)
        }
    }

    return (
        <form className="form_container" onSubmit={handleSubmit}>
            {/* Back arrow */}
            <a href="/forgot-password" className="btn_prev_mdp_oublie">
                <svg xmlns="http://www.w3.org/2000/svg" width="31.621" height="25.241" viewBox="0 0 31.621 25.241">
                    <g transform="translate(-754.379 -406.379)">
                        <line x1="0" x2="27" transform="translate(756.5 418.5)" fill="none" stroke="#efe4ef" strokeLinecap="round" strokeWidth="3" />
                        <line y1="10" x2="10" transform="translate(756.5 408.5)" fill="none" stroke="#efe4ef" strokeLinecap="round" strokeWidth="3" />
                        <line x2="10" y2="10.9" transform="translate(756.5 418.6)" fill="none" stroke="#efe4ef" strokeLinecap="round" strokeWidth="3" />
                    </g>
                </svg>
            </a>

            {message && (
                <p className={message.ok ? 'message_true_container' : 'message_false_container'}
                    style={{ position: 'static', animation: 'none', marginBottom: 16 }}>
                    {message.text}
                </p>
            )}

            <p>Rentre ton nouveau mot de passe.</p>

            <div className="input_container">
                <label htmlFor="input_mdp">
                    <span>Nouveau mot de passe</span>
                    <input
                        type="password"
                        className="input_connexion input_mdp"
                        id="input_mdp"
                        required
                        autoComplete="new-password"
                        minLength={8}
                        value={newPassword}
                        onChange={event => setNewPassword(event.target.value)}
                    />
                    <p className="mdp_restriction">8 caractères min. • 1 majuscule • 1 minuscule</p>
                </label>
            </div>

            <div className="input_container">
                <label htmlFor="input_mdp_validation">
                    <span>Confirmer le nouveau mot de passe</span>
                    <input
                        type="password"
                        className="input_connexion mdp_confirm"
                        id="input_mdp_validation"
                        required
                        autoComplete="new-password"
                        value={confirmPassword}
                        onChange={event => setConfirmPassword(event.target.value)}
                    />
                </label>
            </div>

            <button type="submit" className="btn btn_connexion" disabled={loading}>
                {loading ? '...' : 'Valider'}
            </button>
        </form>
    )
}

export default function ChangePasswordPage() {
    return (
        <main className="main_content">
            {/* Background video */}
            <video className="background_video" autoPlay loop muted playsInline>
                <source src="/sources/video/videobackPT.mp4" type="video/mp4" />
            </video>

            <Suspense fallback={null}>
                <ChangePasswordForm />
            </Suspense>
        </main>
    )
}
