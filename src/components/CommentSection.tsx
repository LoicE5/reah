'use client';

import { useState, useEffect } from 'react';

interface Comment {
  comment_id:           number;
  comment_content:      string;
  comment_date:         string;
  comment_user_id:      number | null;
  user_username:        string | null;
  user_profile_picture: string | null;
}

interface CommentSectionProps {
  videoId:     number;
  currentUserId?: number;
  isAdmin?: boolean;
}

export default function CommentSection({ videoId, currentUserId, isAdmin }: CommentSectionProps) {
  const [commentList, setCommentList] = useState<Comment[]>([]);
  const [content, setContent]         = useState('');
  const [loading, setLoading]         = useState(false);
  const [posting, setPosting]         = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/videos/${videoId}/comments`)
      .then(r => r.json())
      .then(data => setCommentList(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [videoId]);

  async function postComment(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() || posting) return;
    setPosting(true);
    try {
      const res = await fetch(`/api/videos/${videoId}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      });
      if (res.ok) {
        setContent('');
        // Reload comments
        const updated = await fetch(`/api/videos/${videoId}/comments`).then(r => r.json());
        setCommentList(updated);
      }
    } catch { /* fail silently */ }
    finally { setPosting(false); }
  }

  async function deleteComment(commentId: number) {
    await fetch(`/api/videos/${videoId}/comments/${commentId}`, { method: 'DELETE' });
    setCommentList(prev => prev.filter(c => c.comment_id !== commentId));
  }

  return (
    <div className="comment_section">
      {currentUserId && (
        <form className="comment_form" onSubmit={postComment} style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
          <input
            className="input_connexion"
            style={{ flex: 1, background: '#1a1a1a', border: '1px solid #333', padding: '8px 12px', borderRadius: 4 }}
            placeholder="Ajouter un commentaire..."
            value={content}
            onChange={e => setContent(e.target.value)}
            maxLength={2000}
          />
          <button className="btn" type="submit" disabled={posting || !content.trim()} style={{ width: 80 }}>
            {posting ? '...' : 'Envoyer'}
          </button>
        </form>
      )}

      {loading ? (
        <p style={{ color: '#888', textAlign: 'center' }}>Chargement...</p>
      ) : commentList.length === 0 ? (
        <p style={{ color: '#888', textAlign: 'center', fontSize: '0.9em' }}>Aucun commentaire pour l&apos;instant.</p>
      ) : (
        <div className="comment_list">
          {commentList.map(comment => (
            <div key={comment.comment_id} className="comment_container" style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/uploads/profile_pictures/${comment.user_profile_picture || 'default.svg'}`}
                alt={comment.user_username ?? ''}
                style={{ height: 32, width: 32, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                onError={e => { (e.target as HTMLImageElement).src = '/sources/img/profile_icon.svg'; }}
              />
              <div style={{ flex: 1 }}>
                <span style={{ color: '#d60036', fontWeight: 600, fontSize: '0.85em' }}>
                  @{comment.user_username}
                </span>
                <p style={{ margin: '4px 0', fontSize: '0.9em' }}>{comment.comment_content}</p>
              </div>
              {(currentUserId === comment.comment_user_id || isAdmin) && (
                <button
                  onClick={() => deleteComment(comment.comment_id)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', padding: 0, alignSelf: 'flex-start' }}
                  title="Supprimer"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
