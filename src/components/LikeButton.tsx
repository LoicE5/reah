'use client';

import { useState } from 'react';

interface LikeButtonProps {
  videoId:    number;
  initialLikes: number;
  initialLiked: boolean;
  isLoggedIn: boolean;
  onLoginRequired?: () => void;
}

/** Popcorn-style like button with optimistic state. Replaces addLike()/removeLike() from functions.js. */
export default function LikeButton({ videoId, initialLikes, initialLiked, isLoggedIn, onLoginRequired }: LikeButtonProps) {
  const [liked, setLiked]   = useState(initialLiked);
  const [likes, setLikes]   = useState(initialLikes);
  const [loading, setLoading] = useState(false);

  async function toggle() {
    if (!isLoggedIn) {
      onLoginRequired?.();
      return;
    }
    if (loading) return;
    setLoading(true);

    const prev = liked;
    // Optimistic update
    setLiked(!prev);
    setLikes(l => prev ? l - 1 : l + 1);

    try {
      const res = await fetch(`/api/videos/${videoId}/like`, {
        method: prev ? 'DELETE' : 'POST',
      });
      const data = await res.json();
      if (res.ok) {
        setLikes(data.likes ?? likes);
      } else {
        // Revert on error
        setLiked(prev);
        setLikes(l => prev ? l + 1 : l - 1);
      }
    } catch {
      setLiked(prev);
      setLikes(l => prev ? l + 1 : l - 1);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className={`like_container${liked ? ' liked' : ''}`}
      onClick={toggle}
      style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}
      title={liked ? 'Je n\'aime plus' : 'J\'aime'}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={liked ? '/sources/img/pop_corn.png' : '/sources/img/pop_corn_icon.svg'}
        className="pop_corn_icon"
        alt="like"
      />
      <span className="pop_corn_number">{likes}</span>
    </div>
  );
}
