'use client';

import { useState } from 'react';
import VideoModal from './VideoModal';
import type { SessionData } from '@/lib/session';

interface VideoCardData {
  video_id:          number;
  video_url:         string | null;
  video_title:       string | null;
  video_poster:      string | null;
  video_like_number: number | null;
  video_user_id:     number;
  user_username:     string | null;
  user_profile_picture: string | null;
  isLiked:           boolean;
  isSaved:           boolean;
  commentCount:      number;
}

interface VideoCardProps {
  video:   VideoCardData;
  session: SessionData | null;
}

/**
 * Replaces the video_container PHP HTML block rendered in fil_actu.php, saved.php, profil.php.
 * On click opens the VideoModal (replaces the popupFilm() AJAX pattern).
 */
export default function VideoCard({ video, session }: VideoCardProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const isLoggedIn = !!session;

  return (
    <>
      <div
        className="video_container"
        onClick={() => setModalOpen(true)}
        style={{ cursor: 'pointer' }}
      >
        {/* Poster */}
        <div className="film_poster" style={{ position: 'relative', overflow: 'hidden' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/uploads/videos_posters/${video.video_poster || 'default.jpg'}`}
            alt={video.video_title ?? ''}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            onError={e => { (e.target as HTMLImageElement).src = '/sources/img/film_icon.svg'; }}
          />
        </div>

        {/* Info bar */}
        <div className="film_info">
          {/* User */}
          <div className="user_container" onClick={e => { e.stopPropagation(); window.location.href = `/profile/${video.video_user_id}`; }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={`/uploads/profile_pictures/${video.user_profile_picture || 'default.svg'}`}
              alt={video.user_username ?? ''}
              className="pp_profile"
              onError={e => { (e.target as HTMLImageElement).src = '/sources/img/profile_icon.svg'; }}
            />
            <p className="username_film">@{video.user_username}</p>
          </div>

          {/* Title */}
          <p className="film_title">{video.video_title}</p>

          {/* Reactions */}
          <div className="film_reactions" onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, cursor: 'pointer' }}>
              <div className={`popcorn_icon${video.isLiked ? ' liked' : ''}`} />
              <span className="like_number">{video.video_like_number ?? 0}</span>
            </div>
            <div className="comment_icon" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ fontSize: '0.8em', color: '#888' }}>{video.commentCount}</span>
            </div>
          </div>
        </div>
      </div>

      {modalOpen && (
        <VideoModal
          videoId={video.video_id}
          currentUserId={session?.userId}
          isAdmin={session?.isAdmin}
          isLoggedIn={isLoggedIn}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
}
