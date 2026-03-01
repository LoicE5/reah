'use client'

import { useState, useEffect } from 'react'

interface CountdownTimerProps {
    endDate: string // ISO date string or any Date-parseable string
    className?: string
}

/**
 * Replaces the PHP countdownTimer() JS function from functions.js.
 * Displays remaining time until the challenge ends.
 */
export default function CountdownTimer({ endDate, className }: CountdownTimerProps) {
    const [timeLeft, setTimeLeft] = useState('')

    useEffect(() => {
        function calculate() {
            const end = new Date(endDate).getTime()
            const now = Date.now()
            const diff = end - now

            if (diff <= 0) {
                setTimeLeft('Terminé')
                return
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24))
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
            const seconds = Math.floor((diff % (1000 * 60)) / 1000)

            if (days > 0) {
                setTimeLeft(`${days}j ${hours}h ${minutes}m ${seconds}s`)
            } else {
                setTimeLeft(`${hours}h ${minutes}m ${seconds}s`)
            }
        }

        calculate()
        const interval = setInterval(calculate, 1000)
        return () => clearInterval(interval)
    }, [endDate])

    return <span className={className}>{timeLeft}</span>
}
