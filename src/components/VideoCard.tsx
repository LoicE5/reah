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

/** Mirrors the .video_container HTML from fil_actu.php. Opens VideoModal on click. */
export default function VideoCard({ video, session }: VideoCardProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const isLoggedIn = !!session;

  return (
    <>
      <div className="video_container" onClick={() => setModalOpen(true)} style={{ cursor: 'pointer' }}>

        {/* Video area: poster fills the 360×640 box, user chip overlaid top-left */}
        <div className="video_content">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`/uploads/videos_posters/${video.video_poster || 'default.jpg'}`}
            className="video_poster"
            alt={video.video_title ?? ''}
            onError={e => { (e.target as HTMLImageElement).src = '/sources/img/dark_film_icon.svg'; }}
          />
          <div
            className="user_container"
            onClick={e => { e.stopPropagation(); window.location.href = `/profile/${video.video_user_id}`; }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={video.user_profile_picture ? `/uploads/profile_pictures/${video.user_profile_picture}` : '/sources/img/profile_icon.svg'}
              alt={video.user_username ?? ''}
              className="pp_profile"
              onError={e => { (e.target as HTMLImageElement).src = '/sources/img/profile_icon.svg'; }}
            />
            <p className="pseudo">@{video.user_username}</p>
          </div>
        </div>

        {/* Info below the video */}
        <div className="description_container">
          <div className="fb_jsb">
            <div className="synopsis_title_container">
              <h3 className="synopsis_title">{video.video_title}</h3>
              <p className="see_more">
                Voir plus&nbsp;
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/sources/img/see_more_arrow.svg" className="see_more_arrow" alt="" />
              </p>
            </div>

            <div className="reaction_container" onClick={e => e.stopPropagation()} style={{ justifyContent: 'flex-end', gap: 12 }}>
              <div className="like_container" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={video.isLiked ? '/sources/img/pop_corn.png' : '/sources/img/pop_corn_icon.svg'}
                  className="pop_corn_icon"
                  alt="like"
                  onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
                <p className="pop_corn_number">{video.video_like_number ?? 0}</p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <div className="comment_icon" />
                <p className="pop_corn_number">{video.commentCount}</p>
              </div>
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
