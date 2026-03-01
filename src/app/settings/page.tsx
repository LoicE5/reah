import { requireAuth } from '@/lib/session';
import { db } from '@/lib/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import SettingsForm from './SettingsForm';
import '@/styles/settings.css';

export default async function SettingsPage() {
  const session = await requireAuth();

  const [user] = await db.select().from(users).where(eq(users.user_id, session.userId)).limit(1);
  if (!user) return null;

  return (
    <main className="main_content">
      <Nav user={session} profilePic={user.user_profile_picture ?? ''} />

      <div className="settings_container" style={{ padding: '80px 5% 40px', maxWidth: 700, margin: '0 auto' }}>
        <h1 style={{ color: 'white' }}>Paramètres</h1>
        <SettingsForm user={{
          user_id:              user.user_id,
          user_username:        user.user_username,
          user_name:            user.user_name ?? '',
          user_bio:             user.user_bio ?? '',
          user_website:         user.user_website ?? '',
          user_profile_picture: user.user_profile_picture ?? '',
          user_banner:          user.user_banner ?? '',
        }} />
      </div>

      <Footer />
    </main>
  );
}
