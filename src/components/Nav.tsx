import type { SessionData } from '@/lib/session';
import Link from 'next/link';
import SearchBar from './SearchBar';
import BurgerMenu from './BurgerMenu';
import NavProfileButton from './NavProfileButton';

interface NavProps {
  user: SessionData | null;
  /** Profile picture filename from the DB, e.g. "abc123.jpg". */
  profilePic?: string;
  activeCategory?: 1 | 2 | 3;
}

/**
 * Top navigation bar — mirrors the <nav> HTML from fil_actu.php.
 * SearchBar and NavProfileButton are Client Components; the rest is Server-rendered.
 */
export default function Nav({ user, profilePic, activeCategory = 1 }: NavProps) {
  return (
    <>
      <nav>
        <Link className="reah_logo" href="/feed" aria-label="REAH" />

        <div className="menu_nav">
          <div className="menu_category">
            <Link href="/feed" className={`category_title category_title1${activeCategory === 1 ? ' category_title_click' : ''}`}>
              {user ? "Fil d'actualité" : 'Nouveautés'}
            </Link>
            <Link href="/challenges" className={`category_title category_title2${activeCategory === 2 ? ' category_title_click' : ''}`}>
              Défis du moment
            </Link>
            <Link href="/feed" className={`category_title category_title3${activeCategory === 3 ? ' category_title_click' : ''}`}>
              Explorer
            </Link>
            <div className="red_line underline" />
            <div className="fb_jsb ai-c category_list">
              <p className="category_list_title">Catégories</p>
              <div className="category_triangle" />
            </div>
          </div>

          <SearchBar />

          <div className="menu_profile">
            <Link href="/challenges" className="defi_icon" aria-label="Défis" />
            {user ? (
              <NavProfileButton profilePic={profilePic ?? ''} />
            ) : (
              <Link href="/login" className="se-connecter menu_pp_icon" aria-label="Se connecter" />
            )}
          </div>
        </div>
      </nav>

      <div className="category_list_container">
        <Link href="/feed" className="category_list_category category_list_category1">
          {user ? "Fil d'actualité" : 'Nouveautés'}
        </Link>
        <Link href="/challenges" className="category_list_category category_list_category2">Défis du moment</Link>
        <Link href="/feed" className="category_list_category category_list_category3">Explorer</Link>
      </div>

      <BurgerMenu isAdmin={user?.isAdmin ?? false} />
    </>
  );
}
