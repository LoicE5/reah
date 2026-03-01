import Link from 'next/link';

interface SideMenuProps {
  isAdmin: boolean;
}

/** Server Component — the static content of the burger menu. */
export default function SideMenu({ isAdmin }: SideMenuProps) {
  return (
    <div className="menu_container" id="side_menu">
      <Link href="/profile/me" className="menu_option profil">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/sources/img/profile_icon.svg" alt="" />
        <p className="menu_option_title">Profil</p>
      </Link>

      <Link href="/notifications" className="menu_option notifications">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/sources/img/notifications_icon.svg" alt="" />
        <p className="menu_option_title">Notifications</p>
      </Link>

      <Link href="/saved" className="registered menu_option">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/sources/img/saved_icon.svg" alt="" />
        <p className="menu_option_title">Enregistrés</p>
      </Link>

      <Link href="/settings" className="settings menu_option">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/sources/img/settings_icon.svg" alt="" />
        <p className="menu_option_title">Paramètres</p>
      </Link>

      {isAdmin && (
        <Link href="/admin" className="backoffice menu_option">
          <p className="menu_option_title">Back Office</p>
        </Link>
      )}

      <LogoutButton />
    </div>
  );
}

/** Tiny Client Component just for the logout POST action. */
function LogoutButton() {
  return (
    <form action="/api/auth/logout" method="POST" style={{ width: '100%' }}>
      <button
        type="submit"
        className="disconnection menu_option"
        style={{
          background: 'none',
          border: 'none',
          width: '100%',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/sources/img/disconnection_icon.svg" alt="" style={{ height: 20 }} />
        <p className="menu_option_title">Déconnexion</p>
      </button>
    </form>
  );
}
