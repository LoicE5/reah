'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import '@/styles/inscription.css'

const DAYS = Array.from({ length: 31 }, (_, i) => i + 1)
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1)
const YEARS = Array.from({ length: new Date().getFullYear() - 16 - 1899 }, (_, i) => new Date().getFullYear() - 16 - i)

export default function SignupPage() {
    const router = useRouter()
    const [step, setStep] = useState(1)

    // Step 1 fields
    const [lastName, setLastName] = useState('')
    const [firstName, setFirstName] = useState('')
    const [birthDay, setBirthDay] = useState('')
    const [birthMonth, setBirthMonth] = useState('')
    const [birthYear, setBirthYear] = useState('')

    // Step 2 fields
    const [email, setEmail] = useState('')
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [passwordConfirm, setPasswordConfirm] = useState('')
    const [cgu, setCgu] = useState(false)

    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    // Step 1 is valid when all fields are filled
    const step1Valid = lastName.trim() && firstName.trim() && birthDay && birthMonth && birthYear

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setError('')

        if (password !== passwordConfirm) {
            setError('Les mots de passe ne correspondent pas.')
            return
        }
        if (!cgu) {
            setError('Tu dois accepter les conditions d\'utilisation.')
            return
        }

        setLoading(true)
        try {
            const birthday = `${birthDay}/${birthMonth}/${birthYear}`
            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lastName, firstName, username, email, password, birthday, cgu }),
            })
            const data = await res.json()
            if (!res.ok) {
                setError(data.error ?? 'Erreur lors de l\'inscription.')
            } else {
                router.push(`/verify-email?email=${encodeURIComponent(email)}`)
            }
        } catch {
            setError('Erreur réseau. Réessaie.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <Link href="/feed" className="reah_logo">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/sources/img/dark_reah_logo.png" alt="REAH" />
            </Link>

            <main className="main_content">
                {error && <p className="message_false_container">{error}</p>}

                <video className="background_video" autoPlay loop muted playsInline>
                    <source src="/sources/video/videobackPT.mp4" type="video/mp4" />
                </video>

                <div className="alert_message_container">
                    <div className="alert_message hide" />
                </div>

                {/* Step 1 */}
                {step === 1 && (
                    <div className="form_container">
                        <div className="btn google_btn">S&apos;inscrire avec Google</div>
                        <div className="ou_section">
                            <div className="line" />
                            <p>OU</p>
                            <div className="line" />
                        </div>

                        <div className="input_container">
                            <label htmlFor="last_name">
                                <span>Nom</span>
                                <input type="text" className="input_connexion" id="last_name" value={lastName}
                                    onChange={e => setLastName(e.target.value)} required />
                            </label>
                        </div>

                        <div className="input_container">
                            <label htmlFor="first_name">
                                <span>Prénom</span>
                                <input type="text" className="input_connexion" id="first_name" value={firstName}
                                    onChange={e => setFirstName(e.target.value)} required />
                            </label>
                        </div>

                        <div className="select_container">
                            <select value={birthDay} onChange={e => setBirthDay(e.target.value)} required>
                                <option value="" disabled>JJ</option>
                                {DAYS.map(d => <option key={d} value={d}>{String(d).padStart(2, '0')}</option>)}
                            </select>
                            <select value={birthMonth} onChange={e => setBirthMonth(e.target.value)} required>
                                <option value="" disabled>MM</option>
                                {MONTHS.map(m => <option key={m} value={m}>{String(m).padStart(2, '0')}</option>)}
                            </select>
                            <select value={birthYear} onChange={e => setBirthYear(e.target.value)} required>
                                <option value="" disabled>AAAA</option>
                                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                        </div>

                        <button
                            type="button"
                            className={`btn btn_next ${step1Valid ? 'can_click' : 'cannot_click'}`}
                            onClick={() => step1Valid && setStep(2)}
                        >
                            Suivant
                        </button>

                        <Link href="/login" className="link">J&apos;ai déjà un compte !</Link>
                    </div>
                )}

                {/* Step 2 */}
                {step === 2 && (
                    <form className="form_container" onSubmit={handleSubmit}>
                        <button type="button" className="btn_prev" style={{ background: 'none', border: 'none', cursor: 'pointer' }}
                            onClick={() => setStep(1)}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="31.621" height="25.241" viewBox="0 0 31.621 25.241">
                                <g transform="translate(-754.379 -406.379)">
                                    <line x2="27" transform="translate(756.5 418.5)" stroke="#efe4ef" strokeLinecap="round" strokeWidth="3" />
                                    <line y1="10" x2="10" transform="translate(756.5 408.5)" stroke="#efe4ef" strokeLinecap="round" strokeWidth="3" />
                                    <line x2="10" y2="10.9" transform="translate(756.5 418.6)" stroke="#efe4ef" strokeLinecap="round" strokeWidth="3" />
                                </g>
                            </svg>
                        </button>

                        <div className="input_container">
                            <label htmlFor="email">
                                <span>E-mail</span>
                                <input type="email" className="input_connexion" id="email" value={email}
                                    onChange={e => setEmail(e.target.value)} required />
                            </label>
                        </div>

                        <div className="input_container">
                            <label htmlFor="username">
                                <span>Pseudo</span>
                                <input type="text" className="input_connexion" id="username" value={username}
                                    onChange={e => setUsername(e.target.value)} required />
                            </label>
                        </div>

                        <div className="input_container">
                            <label htmlFor="password">
                                <span>Mot de passe</span>
                                <input type="password" className="input_connexion" id="password" value={password}
                                    onChange={e => setPassword(e.target.value)} required minLength={8} />
                            </label>
                            <p className="mdp_restriction">8 caractères min. • 1 majuscule min.</p>
                        </div>

                        <div className="input_container">
                            <label htmlFor="password_confirm">
                                <span>Confirmer le mot de passe</span>
                                <input type="password" className="input_connexion" id="password_confirm" value={passwordConfirm}
                                    onChange={e => setPasswordConfirm(e.target.value)} required />
                            </label>
                        </div>

                        <div className="checkbox_container">
                            <input id="cgu" type="checkbox" className="checkbox" checked={cgu} onChange={e => setCgu(e.target.checked)} required />
                            <label htmlFor="cgu" className="checkbox_label">
                                J&apos;accepte les <Link href="/terms" className="link" target="_blank">CGU</Link>
                            </label>
                        </div>

                        <button type="submit" className="btn btn_inscription" disabled={loading}>
                            {loading ? 'Inscription...' : "S'inscrire"}
                        </button>
                    </form>
                )}
            </main>
        </>
    )
}
