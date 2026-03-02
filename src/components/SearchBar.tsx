'use client'

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface SearchResults {
    videos: { video_id: number, video_title: string, video_poster: string }[]
    users: { user_id: number, user_username: string, user_profile_picture: string }[]
    defis: { defi_id: number, defi_name: string, defi_image: string }[]
}

/**
 * Search bar with live dropdown results.
 * Replaces the PHP inline searchEngine() function + jQuery AJAX call to actions.php.
 */
export default function SearchBar() {
    const router = useRouter()
    const [results, setResults] = useState<SearchResults | null>(null)
    const [open, setOpen] = useState(false)
    const [query, setQuery] = useState('')
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    const search = useCallback((value: string) => {
        if (debounceRef.current) clearTimeout(debounceRef.current)
        if (!value.trim()) {
            setResults(null)
            setOpen(false)
            return
        }
        debounceRef.current = setTimeout(async () => {
            try {
                const res = await fetch(`/api/search?q=${encodeURIComponent(value)}`)
                if (res.ok) {
                    const data = await res.json()
                    setResults(data)
                    setOpen(true)
                }
            } catch (error: unknown) { console.error(error) }
        }, 300)
    }, [])

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        if (query.trim()) {
            setOpen(false)
            router.push(`/search?research=${encodeURIComponent(query)}`)
        }
    }

    return (
        <div style={{ position: 'relative' }}>
            <form className="form_search_bar" onSubmit={handleSubmit}>
                <input
                    className="search_bar"
                    type="text"
                    placeholder="Défis, courts-métrages, utilisateurs..."
                    value={query}
                    onChange={event => {
                        setQuery(event.target.value)
                        search(event.target.value)
                    }}
                    onBlur={() => setTimeout(() => setOpen(false), 200)}
                    onFocus={() => results && setOpen(true)}
                    autoComplete="off"
                />
            </form>

            {open && results && (
                <div id="search_list">
                    {results.videos.map(video => (
                        <a
                            key={video.video_id}
                            className="search_list_result"
                            href={`/feed?video=${video.video_id}`}
                            onClick={() => setOpen(false)}
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            {video.video_poster && (
                                <img
                                    src={`/uploads/videos_posters/${video.video_poster}`}
                                    draggable={false}
                                    alt=""
                                    style={{ height: 30, width: 40, objectFit: 'cover', marginRight: 8 }}
                                />
                            )}
                            <span>{video.video_title}</span>
                        </a>
                    ))}
                    {results.users.map(user => (
                        <a
                            key={user.user_id}
                            className="search_list_result"
                            href={`/profile/${user.user_id}`}
                            onClick={() => setOpen(false)}
                        >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={user.user_profile_picture ? `/uploads/profile_pictures/${user.user_profile_picture}` : '/sources/img/profile_icon.svg'}
                                draggable={false}
                                alt=""
                                style={{ height: 30, width: 30, borderRadius: '50%', marginRight: 8, objectFit: 'cover' }}
                                onError={event => { (event.target as HTMLImageElement).src = '/sources/img/profile_icon.svg' }}
                            />
                            <span>@{user.user_username}</span>
                        </a>
                    ))}
                    {results.defis.map(defi => (
                        <a
                            key={defi.defi_id}
                            className="search_list_result"
                            href={`/challenges/${defi.defi_id}`}
                            onClick={() => setOpen(false)}
                        >
                            <span>🎬 {defi.defi_name}</span>
                        </a>
                    ))}
                    {results.videos.length === 0 && results.users.length === 0 && results.defis.length === 0 && (
                        <p style={{ padding: '10px', color: '#888', margin: 0 }}>Aucun résultat</p>
                    )}
                </div>
            )}
        </div>
    )
}
