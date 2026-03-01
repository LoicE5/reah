'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import '@/styles/connexion.css';

export default function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const mdpSuccess    = params.get('mdp') === 'true';
  const signupSuccess = params.get('signup') === 'true';

  const [credential, setCredential] = useState('');
  const [password, setPassword]     = useState('');
  const [error, setError]           = useState('');
  const [loading, setLoading]       = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Erreur de connexion.');
      } else {
        router.push('/feed');
      }
    } catch {
      setError('Erreur réseau. Réessaie.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <body style={{ background: 'black' }}>
      <Link href="/feed" className="reah_logo">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/sources/img/dark_reah_logo.png" alt="REAH" />
      </Link>

      <main className="main_content">
        {mdpSuccess    && <p className="message_true_container">Votre mot de passe a bien été modifié.</p>}
        {signupSuccess && <p className="message_true_container">Votre inscription est un succès ! Veuillez vous connecter.</p>}
        {error         && <p className="message_false_container">{error}</p>}

        <video className="background_video" autoPlay loop muted playsInline>
          <source src="/sources/video/videobackPT.mp4" type="video/mp4" />
        </video>

        <form className="form_container" onSubmit={handleSubmit}>
          {/* Google button (placeholder) */}
          <div className="btn google_btn">Se connecter avec Google</div>

          <div className="ou_section">
            <div className="line" />
            <p>OU</p>
            <div className="line" />
          </div>

          <div className="input_container">
            <label htmlFor="pseudo">
              <span>Pseudo/E-mail</span>
              <input
                type="text"
                className="input_connexion input_email"
                id="pseudo"
                value={credential}
                onChange={e => setCredential(e.target.value)}
                autoComplete="username"
                required
              />
            </label>
          </div>

          <div className="input_container">
            <label htmlFor="mdp">
              <span>Mot de passe</span>
              <input
                type="password"
                className="input_connexion"
                id="mdp"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </label>
          </div>

          <div className="checkbox_container">
            <input id="resterConnecte" type="checkbox" className="checkbox" />
            <label htmlFor="resterConnecte" className="checkbox_label">Rester connecté</label>
          </div>

          <Link href="/forgot-password" className="link">Mot de passe oublié ?</Link>

          <button
            type="submit"
            className="btn btn_connexion"
            disabled={loading}
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>

          <Link href="/signup" className="link">S&apos;inscrire</Link>
        </form>
      </main>
    </body>
  );
}
