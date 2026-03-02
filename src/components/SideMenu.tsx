'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface SideMenuProps {
    isAdmin: boolean
    onClose: () => void
}

export default function SideMenu({ isAdmin, onClose }: SideMenuProps) {
    return (
        <div id="side_menu">
            <Link href="/profile/me" className="menu_option profil">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/sources/img/profile_icon.svg" draggable={false} alt="" />
                <p className="menu_option_title">Profil</p>
            </Link>

            <Link href="/notifications" className="menu_option notifications">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/sources/img/notifications_icon.svg" draggable={false} alt="" />
                <p className="menu_option_title">Notifications</p>
            </Link>

            <Link href="/saved" className="registered menu_option">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/sources/img/saved_icon.svg" draggable={false} alt="" />
                <p className="menu_option_title">Enregistrés</p>
            </Link>

            <Link href="/settings" className="settings menu_option">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/sources/img/settings_icon.svg" draggable={false} alt="" />
                <p className="menu_option_title">Paramètres</p>
            </Link>

            {isAdmin && (
                <Link href="/admin" className="backoffice menu_option">
                    <p className="menu_option_title">Back Office</p>
                </Link>
            )}

            <LogoutItem onClose={onClose} />
        </div>
    )
}

function LogoutItem({ onClose }: { onClose: () => void }) {
    const router = useRouter()

    async function handleLogout() {
        onClose()
        await fetch('/api/auth/logout', { method: 'POST' })
        router.push('/feed')
    }

    return (
        // eslint-disable-next-line @next/next/no-img-element
        <div className="disconnection menu_option" onClick={handleLogout} style={{ cursor: 'pointer' }}>
            <img src="/sources/img/disconnection_icon.svg" draggable={false} alt="" style={{ height: 20 }} />
            <p className="menu_option_title">Déconnexion</p>
        </div>
    )
}
