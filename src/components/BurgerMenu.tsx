'use client';

import { useEffect, useRef } from 'react';
import SideMenu from './SideMenu';

interface BurgerMenuProps {
  isAdmin: boolean;
}

/**
 * Client wrapper that handles the toggle animation for the side menu.
 * Replaces PHP's toggleBurgerMenu() jQuery function.
 */
export default function BurgerMenu({ isAdmin }: BurgerMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null);
  const openRef = useRef(false);

  // Expose toggle function globally so the Nav profile photo onclick can call it
  useEffect(() => {
    (window as unknown as Record<string, unknown>).toggleBurgerMenu = toggle;
  }, []);

  function toggle() {
    const el = menuRef.current;
    if (!el) return;
    if (!openRef.current) {
      el.classList.add('menu_container_click');
      el.classList.remove('menu_container_click2');
      openRef.current = true;
    } else {
      el.classList.add('menu_container_click2');
      el.classList.remove('menu_container_click');
      openRef.current = false;
    }
  }

  return (
    <div ref={menuRef} className="menu_container">
      <SideMenu isAdmin={isAdmin} />
    </div>
  );
}
