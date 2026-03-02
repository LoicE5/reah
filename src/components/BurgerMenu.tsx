'use client'

import { useEffect, useRef } from 'react'
import SideMenu from './SideMenu'

interface BurgerMenuProps {
    isAdmin: boolean
}

/**
 * Client wrapper that handles the toggle animation for the side menu.
 * Replaces PHP's toggleBurgerMenu() jQuery function.
 */
export default function BurgerMenu({ isAdmin }: BurgerMenuProps) {
    const menuRef = useRef<HTMLDivElement>(null)
    const openRef = useRef(false)

    // Expose toggle function globally so the Nav profile photo onclick can call it
    useEffect(() => {
        (window as unknown as Record<string, unknown>).toggleBurgerMenu = toggle

        function handleClickOutside(event: MouseEvent) {
            if (openRef.current && menuRef.current && !menuRef.current.contains(event.target as Node)) {
                close()
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    function toggle() {
        openRef.current ? close() : open()
    }

    function open() {
        const menuElement = menuRef.current
        if (!menuElement) return
        menuElement.classList.add('menu_container_click')
        menuElement.classList.remove('menu_container_click2')
        openRef.current = true
    }

    function close() {
        const menuElement = menuRef.current
        if (!menuElement) return
        menuElement.classList.add('menu_container_click2')
        menuElement.classList.remove('menu_container_click')
        openRef.current = false
    }

    return (
        <div ref={menuRef} className="menu_container">
            <SideMenu isAdmin={isAdmin} onClose={close} />
        </div>
    )
}
