'use client';

import { useState } from 'react';

interface ShareModalProps {
  videoId:  number;
  title:    string;
  onClose:  () => void;
}

export default function ShareModal({ videoId, title, onClose }: ShareModalProps) {
  const url = `${window.location.origin}/feed?video=${videoId}`;
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const el = document.createElement('textarea');
      el.value = url;
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      setCopied(true);
    }
  }

  const encodedUrl   = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const socials = [
    { label: 'Facebook',  href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,              cls: 'facebook_logo' },
    { label: 'Twitter',   href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,  cls: 'twitter_logo' },
    { label: 'LinkedIn',  href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,        cls: 'linkedin_logo' },
    { label: 'Mail',      href: `mailto:?subject=${encodedTitle}&body=${encodedUrl}`,                        cls: 'mail_logo' },
  ];

  return (
    <div className="dark_filter" style={{ display: 'flex', zIndex: 300 }} onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="pop_up_container share_film_container" style={{ display: 'flex' }}>
        <div className="pop_up_header">
          <h2>Partager</h2>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/sources/img/close_icon.svg" alt="Fermer" className="share_close_icon" onClick={onClose} />
        </div>

        <div className="logo_container" style={{ padding: '0 30px' }}>
          {socials.map(s => (
            <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer" style={{ textAlign: 'center', color: 'var(--text)', textDecoration: 'none' }}>
              <div className={`share_logo ${s.cls}`} />
              <p style={{ margin: '4px 0', fontSize: '0.8em' }}>{s.label}</p>
            </a>
          ))}
        </div>

        <div className="share_link" style={{ padding: '0 30px', marginBottom: 20 }}>
          <p style={{ wordBreak: 'break-all', fontSize: '0.85em' }}>{url}</p>
          <button className="btn share_btn" onClick={copyLink} style={{ flexShrink: 0 }}>
            {copied ? 'Copié !' : 'Copier'}
          </button>
        </div>
      </div>
    </div>
  );
}
