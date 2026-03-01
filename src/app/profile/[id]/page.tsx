import { notFound } from 'next/navigation';
import { getCurrentUser } from '@/lib/session';
import { db } from '@/lib/db';
import { users, subscription } from '@/db/schema';
import { eq, count, and } from 'drizzle-orm';
import { getUserVideos, getLikedVideoIds, getSavedVideoIds } from '@/lib/queries';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import VideoCard from '@/components/VideoCard';
import SubscriptionButton from './SubscriptionButton';
import '@/styles/profil.css';

type PageProps = { params: Promise<{ id: string }> };

export default async function ProfilePage({ params }: PageProps) {
  const { id } = await params;
  const session = await getCurrentUser();

  // Resolve "me" → actual user id
  const targetId = id === 'me' ? session?.userId : Number(id);
  if (!targetId || isNaN(targetId)) notFound();

  let navProfilePic = '';
  if (session) {
    const [u] = await db.select({ pic: users.user_profile_picture }).from(users).where(eq(users.user_id, session.userId)).limit(1);
    navProfilePic = u?.pic ?? '';
  }

  const [profileUser] = await db.select().from(users).where(eq(users.user_id, targetId)).limit(1);
  if (!profileUser) notFound();

  const [{ followerCount }] = await db.select({ followerCount: count() }).from(subscription).where(eq(subscription.subscription_artist_id, targetId));
  const [{ followingCount }] = await db.select({ followingCount: count() }).from(subscription).where(eq(subscription.subscription_subscriber_id, targetId));

  const profileVideos = await getUserVideos(targetId);
  const allIds   = profileVideos.map(v => v.video_id);
  const likedSet = session ? await getLikedVideoIds(session.userId, allIds) : new Set<number>();
  const savedSet = session ? await getSavedVideoIds(session.userId) : new Set<number>();

  const enriched = profileVideos.map(v => ({ ...v, isLiked: likedSet.has(v.video_id), isSaved: savedSet.has(v.video_id) }));

  const isOwnProfile = session?.userId === targetId;

  // Is current user subscribed to this profile?
  let isSubscribed = false;
  if (session && !isOwnProfile) {
    const [sub] = await db
      .select()
      .from(subscription)
      .where(and(eq(subscription.subscription_subscriber_id, session.userId), eq(subscription.subscription_artist_id, targetId)))
      .limit(1);
    isSubscribed = !!sub;
  }

  return (
    <main className="main_content">
      <Nav user={session} profilePic={navProfilePic} />

      <div className="profil_container">
        {/* Banner */}
        <div className="banner_container">
          {profileUser.user_banner ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={`/uploads/banners/${profileUser.user_banner}`} alt="" className="banner_img" />
          ) : (
            <div className="banner_img" style={{ background: '#1a1a1a' }} />
          )}
        </div>

        {/* Profile info */}
        <div className="profil_info">
          {/* Profile picture */}
          <div className="pp_container">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={profileUser.user_profile_picture ? `/uploads/profile_pictures/${profileUser.user_profile_picture}` : '/sources/img/profile_icon.svg'}
              alt={profileUser.user_username}
              className="pp_profile profil_pp"
              onError={undefined}
            />
          </div>

          {/* Name and username */}
          <div className="profil_text">
            <h1 className="profil_name">{profileUser.user_name || profileUser.user_username}</h1>
            <p className="profil_username">@{profileUser.user_username}</p>
            {profileUser.user_bio && <p className="profil_bio">{profileUser.user_bio}</p>}
            {profileUser.user_website && (
              <a href={profileUser.user_website} target="_blank" rel="noopener noreferrer" className="link profil_website">
                {profileUser.user_website}
              </a>
            )}
          </div>

          {/* Stats */}
          <div className="profil_stats">
            <div className="stat_item">
              <span className="stat_number">{profileVideos.length}</span>
              <span className="stat_label">Vidéos</span>
            </div>
            <div className="stat_item">
              <span className="stat_number">{followerCount}</span>
              <span className="stat_label">Abonnés</span>
            </div>
            <div className="stat_item">
              <span className="stat_number">{followingCount}</span>
              <span className="stat_label">Abonnements</span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="profil_actions">
            {isOwnProfile ? (
              <a href="/settings" className="btn">Modifier le profil</a>
            ) : session ? (
              <SubscriptionButton userId={targetId} initialSubscribed={isSubscribed} />
            ) : null}
          </div>
        </div>

        {/* Videos grid */}
        <h2 style={{ color: 'white', padding: '20px 0 10px' }}>Vidéos</h2>
        <div className="film_container" style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
          {enriched.length === 0 ? (
            <p style={{ color: '#888' }}>Aucune vidéo pour l&apos;instant.</p>
          ) : enriched.map(v => (
            <VideoCard key={v.video_id} video={v} session={session} />
          ))}
        </div>
      </div>

      <Footer />
    </main>
  );
}
