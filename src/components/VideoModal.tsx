'use client';

import { useState, useEffect } from 'react';
import LikeButton from './LikeButton';
import SaveButton from './SaveButton';
import CommentSection from './CommentSection';
import ShareModal from './ShareModal';

interface VideoDetail {
  video_id:          number;
  video_url:         string | null;
  video_title:       string | null;
  video_synopsis:    string | null;
  video_poster:      string | null;
  video_genre:       string | null;
  video_duration:    string | null;
  video_like_number: number;
  video_date:        string | null;
  video_user_id:     number;
  user_username:     string | null;
  user_profile_picture: string | null;
  defiName:          string | null;
  commentCount:      number;
  isLiked:           boolean;
  isSaved:           boolean;
  distributors:      { user_id: number | null; user_username: string | null; user_profile_picture: string | null }[];
}

interface VideoModalProps {
  videoId:       number;
  currentUserId?: number;
  isAdmin?:      boolean;
  isLoggedIn:    boolean;
  onClose:       () => void;
}

/**
 * Full-screen video detail popup.
 * Replaces PHP's film_data.php + the popupFilm() AJAX-inject pattern from functions.js.
 */
export default function VideoModal({ videoId, currentUserId, isAdmin, isLoggedIn, onClose }: VideoModalProps) {
  const [video, setVideo]       = useState<VideoDetail | null>(null);
  const [loading, setLoading]   = useState(true);
  const [showShare, setShowShare] = useState(false);
  const [showComments, setShowComments] = useState(false);

  useEffect(() => {
    fetch(`/api/videos/${videoId}`)
      .then(r => r.json())
      .then(data => setVideo(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [videoId]);

  if (loading) {
    return (
      <div className="dark_filter" style={{ display: 'flex', zIndex: 200 }}>
        <div style={{ color: 'white', margin: 'auto' }}>Chargement...</div>
      </div>
    );
  }

  if (!video) return null;

  return (
    <>
      <div
        className="dark_filter"
        style={{ display: 'flex', zIndex: 200 }}
        onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      >
        <div className="pop_up_container film_information_container" style={{ display: 'flex', maxWidth: 900, width: '90vw', maxHeight: '90vh', overflowY: 'auto' }}>
          <div className="pop_up_header">
            <h2>{video.video_title}</h2>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/sources/img/close_icon.svg"
              alt="Fermer"
              className="connexion_close_icon"
              onClick={onClose}
            />
          </div>

          {/* Vimeo player */}
          {video.video_url && (
            <div className="film_player_container" style={{ position: 'relative', paddingBottom: '56.25%', margin: '0 20px 20px' }}>
              <iframe
                src={`https://player.vimeo.com/video/${video.video_url}`}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                title={video.video_title ?? 'Vidéo'}
              />
            </div>
          )}

          <div style={{ padding: '0 20px 20px' }}>
            {/* Author */}
            <a href={`/profile/${video.video_user_id}`} style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', marginBottom: 12 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/uploads/profile_pictures/${video.user_profile_picture || 'default.svg'}`}
                alt={video.user_username ?? ''}
                style={{ height: 36, width: 36, borderRadius: '50%', objectFit: 'cover' }}
                onError={e => { (e.target as HTMLImageElement).src = '/sources/img/profile_icon.svg'; }}
              />
              <span style={{ color: '#d60036', fontWeight: 600 }}>@{video.user_username}</span>
            </a>

            {/* Synopsis */}
            {video.video_synopsis && <p style={{ margin: '0 0 12px', color: '#ccc', lineHeight: 1.5 }}>{video.video_synopsis}</p>}

            {/* Meta */}
            <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap', marginBottom: 16, fontSize: '0.85em', color: '#888' }}>
              {video.defiName  && <span>🎬 Défi : {video.defiName}</span>}
              {video.video_genre    && <span>🎭 {video.video_genre}</span>}
              {video.video_duration && <span>⏱ {video.video_duration}</span>}
            </div>

            {/* Distribution */}
            {video.distributors.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                <p style={{ color: '#aaa', fontSize: '0.85em', margin: '0 0 6px' }}>Distribution :</p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {video.distributors.map((d, i) => d.user_id && (
                    <a key={i} href={`/profile/${d.user_id}`} style={{ color: '#d60036', fontSize: '0.85em' }}>
                      @{d.user_username}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 20 }}>
              <LikeButton
                videoId={video.video_id}
                initialLikes={video.video_like_number}
                initialLiked={video.isLiked}
                isLoggedIn={isLoggedIn}
              />
              <SaveButton
                videoId={video.video_id}
                initialSaved={video.isSaved}
                isLoggedIn={isLoggedIn}
              />
              <button
                onClick={() => setShowShare(true)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}
                title="Partager"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/sources/img/share_icon.svg" alt="Partager" style={{ height: 20 }} />
              </button>
              <button
                onClick={() => setShowComments(v => !v)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', display: 'flex', alignItems: 'center', gap: 4 }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/sources/img/comment_icon.svg" alt="" style={{ height: 20 }} />
                <span style={{ fontSize: '0.85em' }}>{video.commentCount}</span>
              </button>
            </div>

            {/* Comments */}
            {showComments && (
              <CommentSection
                videoId={video.video_id}
                currentUserId={currentUserId}
                isAdmin={isAdmin}
              />
            )}
          </div>
        </div>
      </div>

      {showShare && (
        <ShareModal
          videoId={video.video_id}
          title={video.video_title ?? ''}
          onClose={() => setShowShare(false)}
        />
      )}
    </>
  );
}
