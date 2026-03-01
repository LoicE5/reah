'use client'

import { useState } from 'react'

interface CategoryTabsProps {
    isLoggedIn: boolean
    initialTab?: 1 | 2 | 3
    tab1Content: React.ReactNode
    tab2Content: React.ReactNode
    tab3Content: React.ReactNode
}

/**
 * Three-tab category switcher for the feed page.
 * Replaces the jQuery category_title click handler from fil_actu.js.
 */
export default function CategoryTabs({ isLoggedIn, initialTab = 1, tab1Content, tab2Content, tab3Content }: CategoryTabsProps) {
    const [active, setActive] = useState(initialTab)

    const tabs: { id: 1 | 2 | 3; label: string }[] = [
        { id: 1, label: isLoggedIn ? "Fil d'actualité" : 'Nouveautés' },
        { id: 2, label: 'Défis du moment' },
        { id: 3, label: 'Explorer' }
    ]

    return (
        <div className="all_category_container">
            {/* Tab header — mirrors the nav category titles */}
            <div className="category_tab_switcher" style={{ display: 'flex', gap: 24, marginBottom: 16, borderBottom: '1px solid #333', paddingBottom: 8 }}>
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        className={`category_title${active === tab.id ? ' category_title_click' : ''}`}
                        onClick={() => setActive(tab.id)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: active === tab.id ? 'var(--text, white)' : 'var(--text-grey, #888)', fontFamily: 'inherit', fontSize: '1em', padding: '0 0 8px', borderBottom: active === tab.id ? '2px solid #d60036' : '2px solid transparent', fontWeight: active === tab.id ? 700 : 400, transition: 'all 0.2s' }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {active === 1 && tab1Content}
            {active === 2 && tab2Content}
            {active === 3 && tab3Content}
        </div>
    )
}
