'use client'

import { useState } from 'react'

interface SubscriptionButtonProps {
    userId: number
    initialSubscribed: boolean
}

export default function SubscriptionButton({ userId, initialSubscribed }: SubscriptionButtonProps) {
    const [subscribed, setSubscribed] = useState(initialSubscribed)
    const [loading, setLoading] = useState(false)

    async function toggle() {
        if (loading) return
        setLoading(true)
        const prev = subscribed
        setSubscribed(!prev)
        try {
            const res = await fetch(`/api/users/${userId}/subscribe`, {
                method: prev ? 'DELETE' : 'POST',
            })
            if (!res.ok) setSubscribed(prev)
        } catch (error: unknown) {
            console.error(error)
            setSubscribed(prev)
        } finally {
            setLoading(false)
        }
    }

    return (
        <button className="btn" onClick={toggle} disabled={loading}>
            {subscribed ? 'Se désabonner' : 'S\'abonner'}
        </button>
    )
}
