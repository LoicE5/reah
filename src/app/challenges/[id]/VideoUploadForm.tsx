'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface VideoUploadFormProps {
    defiId: number
}

const GENRES = ['Court-métrage', 'Animation', 'Documentaire', 'Fiction', 'Comédie', 'Drame', 'Horreur', 'Action', 'Autre']

export default function VideoUploadForm({ defiId }: VideoUploadFormProps) {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [title, setTitle] = useState('')
    const [synopsis, setSynopsis] = useState('')
    const [genre, setGenre] = useState('')
    const [videoFile, setVideoFile] = useState<File | null>(null)
    const [posterFile, setPosterFile] = useState<File | null>(null)
    const [uploading, setUploading] = useState(false)
    const [progress, setProgress] = useState('')
    const [error, setError] = useState('')

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        if (!videoFile || !title.trim()) { setError('Titre et fichier vidéo requis.'); return }
        setError('')
        setUploading(true)
        setProgress('Envoi en cours...')

        const formData = new FormData()
        formData.set('title', title)
        formData.set('synopsis', synopsis)
        formData.set('genre', genre)
        formData.set('defi_id', String(defiId))
        formData.set('video', videoFile)
        if (posterFile) formData.set('poster', posterFile)

        try {
            setProgress('Upload vers Vimeo (peut prendre plusieurs minutes)...')
            const res = await fetch('/api/videos/upload', { method: 'POST', body: formData })
            const data = await res.json()
            if (res.ok) {
                setOpen(false)
                setProgress('')
                router.refresh()
            } else {
                setError(data.error ?? 'Erreur lors de l\'upload.')
            }
        } catch (error: unknown) {
            console.error(error)
            setError('Erreur réseau ou timeout. Réessaie.')
        } finally {
            setUploading(false)
        }
    }

    return (
        <>
            <button className="btn" onClick={() => setOpen(true)} style={{ marginBottom: 20 }}>
                Participer au défi
            </button>

            {open && (
                <div className="dark_filter" style={{ display: 'flex', zIndex: 300 }} onClick={event => event.target === event.currentTarget && setOpen(false)}>
                    <div className="pop_up_container upload_container" style={{ display: 'flex', width: 500, maxHeight: '90vh', overflowY: 'auto' }}>
                        <div className="pop_up_header">
                            <h2>Soumettre une vidéo</h2>
                            <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'white', fontSize: '1.5em' }}>✕</button>
                        </div>

                        {error && <p className="message_false_container" style={{ position: 'static', animation: 'none' }}>{error}</p>}
                        {progress && <p style={{ color: '#d60036', textAlign: 'center', padding: '0 20px' }}>{progress}</p>}

                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '0 20px 20px' }}>
                            <div className="input_container">
                                <label htmlFor="vid_title">
                                    <span>Titre</span>
                                    <input type="text" id="vid_title" className="input_connexion" value={title}
                                        onChange={event => setTitle(event.target.value)} required />
                                </label>
                            </div>

                            <div className="input_container">
                                <label htmlFor="vid_synopsis">
                                    <span>Synopsis</span>
                                    <textarea id="vid_synopsis"
                                        style={{ background: 'transparent', border: 'none', borderBottom: '1px solid white', color: 'white', width: '100%', minHeight: 60, fontFamily: 'inherit', resize: 'vertical' }}
                                        value={synopsis} onChange={event => setSynopsis(event.target.value)} />
                                </label>
                            </div>

                            <div className="input_container">
                                <span>Genre</span>
                                <select id="genre_select" value={genre} onChange={event => setGenre(event.target.value)}>
                                    <option value="">Sélectionner un genre</option>
                                    {GENRES.map(genreOption => <option key={genreOption} value={genreOption}>{genreOption}</option>)}
                                </select>
                            </div>

                            <div className="input_container">
                                <span>Fichier vidéo (MP4, MOV, max 500 Mo)</span>
                                <input type="file" accept="video/mp4,video/quicktime,video/*"
                                    onChange={event => setVideoFile(event.target.files?.[0] ?? null)}
                                    style={{ color: 'white', marginTop: 8 }} required />
                            </div>

                            <div className="input_container">
                                <span>Affiche / thumbnail</span>
                                <input type="file" accept="image/*"
                                    onChange={event => setPosterFile(event.target.files?.[0] ?? null)}
                                    style={{ color: 'white', marginTop: 8 }} />
                            </div>

                            <button type="submit" className="btn" disabled={uploading} style={{ width: '100%' }}>
                                {uploading ? 'Upload en cours...' : 'Envoyer'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    )
}
