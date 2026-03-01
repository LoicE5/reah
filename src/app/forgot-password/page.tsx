'use client'

import { useState } from 'react'
import '@/styles/mdp_oublie.css'

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setMessage(null)
        try {
            const res = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            })
            const data = await res.json()
            if (res.ok) {
                setMessage({ ok: true, text: `Un mail a été envoyé à ${email}` })
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
        <main className="main_content">
            {message && (
                <p className={message.ok ? 'message_true_container' : 'message_false_container'}>
                    {message.text}
                </p>
            )}

            {/* Background video */}
            <video className="background_video" autoPlay loop muted playsInline>
                <source src="/sources/video/videobackPT.mp4" type="video/mp4" />
            </video>

            <form className="form_container" onSubmit={handleSubmit}>
                {/* Back arrow */}
                <a href="/login" className="btn_prev_mdp_oublie">
                    <svg xmlns="http://www.w3.org/2000/svg" width="31.621" height="25.241" viewBox="0 0 31.621 25.241">
                        <g id="Groupe_12" transform="translate(-754.379 -406.379)">
                            <line x1="0" x2="27" transform="translate(756.5 418.5)" fill="none" stroke="#efe4ef" strokeLinecap="round" strokeWidth="3" />
                            <line y1="10" x2="10" transform="translate(756.5 408.5)" fill="none" stroke="#efe4ef" strokeLinecap="round" strokeWidth="3" />
                            <line x2="10" y2="10.9" transform="translate(756.5 418.6)" fill="none" stroke="#efe4ef" strokeLinecap="round" strokeWidth="3" />
                        </g>
                    </svg>
                </a>

                <p>Renseigne ton adresse mail pour réinitialiser ton mot de passe.</p>

                <div className="input_container">
                    <label htmlFor="mail">
                        <span>Adresse mail</span>
                        <input
                            type="email"
                            className="input_connexion input_email"
                            id="mail"
                            name="email"
                            required
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                        />
                    </label>
                </div>

                <button className="btn btn_connexion" type="submit" disabled={loading}>
                    {loading ? 'Envoi...' : 'Envoyer'}
                </button>
            </form>
        </main>
    )
}
