import { notFound } from 'next/navigation';
import { getCurrentUser } from '@/lib/session';
import { db } from '@/lib/db';
import { defis, users, videos } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { getLikedVideoIds, getSavedVideoIds } from '@/lib/queries';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import VideoCard from '@/components/VideoCard';
import CountdownTimer from '@/components/CountdownTimer';
import VideoUploadForm from './VideoUploadForm';
import '@/styles/defi_details.css';

type PageProps = { params: Promise<{ id: string }> };

export default async function ChallengeDetailPage({ params }: PageProps) {
  const { id } = await params;
  const defiId = Number(id);
  if (isNaN(defiId)) notFound();

  const session = await getCurrentUser();

  let profilePic = '';
  if (session) {
    const [user] = await db
      .select({ pic: users.user_profile_picture })
      .from(users)
      .where(eq(users.user_id, session.userId))
      .limit(1);
    profilePic = user?.pic ?? '';
  }

  const [defi] = await db.select().from(defis).where(eq(defis.defi_id, defiId)).limit(1);
  if (!defi) notFound();

  const defiVideos = await db
    .select({
      video_id:          videos.video_id,
      video_url:         videos.video_url,
      video_title:       videos.video_title,
      video_poster:      videos.video_poster,
      video_like_number: videos.video_like_number,
      video_user_id:     videos.video_user_id,
      user_username:     users.user_username,
      user_profile_picture: users.user_profile_picture,
    })
    .from(videos)
    .leftJoin(users, eq(users.user_id, videos.video_user_id))
    .where(eq(videos.video_defi_id, defiId));

  const allIds   = defiVideos.map(v => v.video_id);
  const likedSet = session ? await getLikedVideoIds(session.userId, allIds) : new Set<number>();
  const savedSet = session ? await getSavedVideoIds(session.userId) : new Set<number>();

  const enriched = defiVideos.map(v => ({
    ...v,
    isLiked: likedSet.has(v.video_id),
    isSaved: savedSet.has(v.video_id),
    commentCount: 0, // loaded on modal open
  }));

  return (
    <main className="main_content">
      <Nav user={session} profilePic={profilePic} />

      <div className="defi_details_container">
        {/* Defi header */}
        <div className="defi_header" style={{ position: 'relative', marginBottom: 30 }}>
          {defi.defi_image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={`/uploads/defis_img/${defi.defi_image}`}
              alt={defi.defi_name}
              className="defi_details_img"
            />
          )}
          <div className="defi_details_info">
            <h1 className="defi_details_title">{defi.defi_name}</h1>
            {defi.defi_date_end && (
              <div className="defi_details_timer">
                <CountdownTimer endDate={defi.defi_date_end} />
              </div>
            )}
            {defi.defi_description && (
              <div className="defi_description">
                <p>{defi.defi_description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Video upload form for logged-in users */}
        {session && (
          <VideoUploadForm defiId={defiId} />
        )}

        {/* Submitted videos */}
        <h2 style={{ color: 'white', marginTop: 30 }}>
          Participations ({defiVideos.length})
        </h2>
        <div className="film_container" style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
          {enriched.length === 0 ? (
            <p style={{ color: '#888' }}>Aucune participation pour l&apos;instant. Sois le premier !</p>
          ) : enriched.map(v => (
            <VideoCard key={v.video_id} video={v} session={session} />
          ))}
        </div>
      </div>

      <Footer />
    </main>
  );
}
