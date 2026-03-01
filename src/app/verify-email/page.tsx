'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function VerifyEmailPage() {
    const router = useRouter()
    const params = useSearchParams()
    const email = params.get('email') ?? ''

    const [code, setCode] = useState('')
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [loading, setLoading] = useState(false)

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError('')
        setLoading(true)
        try {
            const res = await fetch('/api/auth/verify-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code }),
            })
            const data = await res.json()
            if (!res.ok) {
                setError(data.error ?? 'Code incorrect.')
            } else {
                setSuccess('Ton compte est vérifié ! Redirection...')
                setTimeout(() => router.push('/login?signup=true'), 2000)
            }
        } catch (error: unknown) {
            console.error(error)
            setError('Erreur réseau.')
        } finally {
            setLoading(false)
        }
    }

    async function resendCode() {
        try {
            await fetch('/api/auth/resend-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            })
            setSuccess('Un nouveau code a été envoyé.')
        } catch (error: unknown) {
            console.error(error)
            setError('Impossible d\'envoyer le code.')
        }
    }

    return (
        <body style={{ background: 'black' }}>
            <Link href="/feed" className="reah_logo" aria-label="REAH" />

            <main className="main_content">
                {error && <p className="message_false_container">{error}</p>}
                {success && <p className="message_true_container">{success}</p>}

                <video className="background_video" autoPlay loop muted playsInline>
                    <source src="/sources/video/videobackPT.mp4" type="video/mp4" />
                </video>

                <form className="form_container" onSubmit={handleSubmit} style={{ gap: 16 }}>
                    <h2 style={{ color: 'white', margin: 0 }}>Vérification de l&apose-mail</h2>
                    <p style={{ color: '#aaa', fontSize: '0.9em', margin: 0 }}>
                        Un code a été envoyé à <strong style={{ color: 'white' }}>{email}</strong>
                    </p>

                    <div className="input_container">
                        <label htmlFor="code">
                            <span>Code de vérification (6 chiffres)</span>
                            <input
                                type="text"
                                className="input_connexion"
                                id="code"
                                value={code}
                                onChange={e => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                maxLength={6}
                                pattern="\d{6}"
                                required
                                style={{ letterSpacing: 8, textAlign: 'center', fontSize: '1.5em' }}
                            />
                        </label>
                    </div>

                    <button type="submit" className="btn btn_connexion" disabled={loading || code.length < 6}>
                        {loading ? 'Vérification...' : 'Vérifier'}
                    </button>

                    <button type="button" className="link" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#d60036', fontWeight: 600 }}
                        onClick={resendCode}>
                        Renvoyer le code
                    </button>
                </form>
            </main>
        </body>
    )
}
