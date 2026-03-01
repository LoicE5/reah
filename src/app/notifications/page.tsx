import { requireAuth } from '@/lib/session';
import { db } from '@/lib/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import '@/styles/notifications.css';

export default async function NotificationsPage() {
  const session = await requireAuth();
  const [user] = await db.select({ pic: users.user_profile_picture }).from(users).where(eq(users.user_id, session.userId)).limit(1);

  return (
    <main className="main_content">
      <Nav user={session} profilePic={user?.pic ?? ''} />

      <div style={{ padding: '80px 5% 40px' }}>
        <h1 style={{ color: 'white' }}>Notifications</h1>
        <p style={{ color: '#888', marginTop: 20 }}>
          Les notifications arrivent bientôt. Stay tuned !
        </p>
      </div>

      <Footer />
    </main>
  );
}
