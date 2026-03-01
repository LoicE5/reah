'use client';

interface NavProfileButtonProps {
  profilePic: string; // filename only, e.g. "abc123.jpg"
}

export default function NavProfileButton({ profilePic }: NavProfileButtonProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={profilePic ? `/uploads/profile_pictures/${profilePic}` : '/sources/img/profile_icon.svg'}
      className="menu_pp"
      alt="Mon profil"
      onClick={() => (window as unknown as Record<string, () => void>).toggleBurgerMenu?.()}
      style={{ cursor: 'pointer' }}
      onError={(e) => {
        (e.target as HTMLImageElement).src = '/sources/img/profile_icon.svg';
      }}
    />
  );
}
