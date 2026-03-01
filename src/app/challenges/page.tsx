import { getCurrentUser } from '@/lib/session';
import { getVerifiedDefis, getCurrentDefis } from '@/lib/queries';
import { db } from '@/lib/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import CountdownTimer from '@/components/CountdownTimer';
import AddDefiForm from './AddDefiForm';
import '@/styles/defis.css';

export default async function ChallengesPage({
  searchParams,
}: {
  searchParams: Promise<{ success?: string }>;
}) {
  const session = await getCurrentUser();
  const sp      = await searchParams;

  let profilePic = '';
  if (session) {
    const [user] = await db
      .select({ pic: users.user_profile_picture })
      .from(users)
      .where(eq(users.user_id, session.userId))
      .limit(1);
    profilePic = user?.pic ?? '';
  }

  const [currentDefis, allDefis] = await Promise.all([
    getCurrentDefis(20),
    getVerifiedDefis(50),
  ]);

  function DefiCard({ defi }: { defi: (typeof allDefis)[0] }) {
    return (
      <a href={`/challenges/${defi.defi_id}`} className="defi_box" style={{ textDecoration: 'none', position: 'relative', display: 'block' }}>
        {defi.defi_image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={`/uploads/defis_img/${defi.defi_image}`}
            alt={defi.defi_name}
            className="defi_img"
            style={{ width: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div className="defi_img" style={{ background: '#1a1a1a', height: 200 }} />
        )}
        <div className="defi_title_container">
          <p className="defi_title">{defi.defi_name}</p>
          {defi.defi_date_end && (
            <CountdownTimer endDate={defi.defi_date_end} className="defi_timer" />
          )}
        </div>
      </a>
    );
  }

  return (
    <main className="main_content">
      <Nav user={session} profilePic={profilePic} activeCategory={2} />

      {sp.success && <p className="message_true_container">Ton défi a été soumis et est en attente de validation.</p>}

      <div className="defis_main">
        {/* Header with add button */}
        <div className="defis_header">
          {session && <AddDefiForm />}
        </div>

        {/* Category 1: Défis du moment */}
        <section className="defi_category_section">
          <div className="defis_category_title_container">
            <h2 className="defis_category_title active_category_title">Défis du moment</h2>
            <h2 className="defis_category_title">À découvrir</h2>
          </div>
          <div className="defi_category category_defi_1 defi_scroll_container">
            {currentDefis.length === 0 ? (
              <p style={{ color: '#888', padding: '40px 0' }}>Aucun défi du moment.</p>
            ) : currentDefis.map(defi => <DefiCard key={defi.defi_id} defi={defi} />)}
          </div>
          <div className="defi_category category_defi_2 defi_scroll_container" style={{ display: 'none' }}>
            {allDefis.map(defi => <DefiCard key={defi.defi_id} defi={defi} />)}
          </div>
        </section>
      </div>

      <Footer />
    </main>
  );
}
