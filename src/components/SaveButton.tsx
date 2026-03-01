'use client';

import { useState } from 'react';

interface SaveButtonProps {
  videoId:       number;
  initialSaved:  boolean;
  isLoggedIn:    boolean;
  onLoginRequired?: () => void;
}

export default function SaveButton({ videoId, initialSaved, isLoggedIn, onLoginRequired }: SaveButtonProps) {
  const [saved, setSaved]     = useState(initialSaved);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    if (!isLoggedIn) {
      onLoginRequired?.();
      return;
    }
    if (loading) return;
    setLoading(true);
    const prev = saved;
    setSaved(!prev);
    try {
      const res = await fetch(`/api/videos/${videoId}/save`, {
        method: prev ? 'DELETE' : 'POST',
      });
      if (!res.ok) setSaved(prev);
    } catch {
      setSaved(prev);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className={`save_icon${saved ? ' saved' : ''}`}
      onClick={toggle}
      style={{ cursor: 'pointer' }}
      title={saved ? 'Retirer des enregistrés' : 'Enregistrer'}
    />
  );
}
