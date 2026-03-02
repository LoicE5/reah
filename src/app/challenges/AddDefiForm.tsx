'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function AddDefiForm() {
    const router = useRouter()
    const [open, setOpen] = useState(false)
    const [title, setTitle] = useState('')
    const [description, setDescription] = useState('')
    const [image, setImage] = useState<File | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        if (!title.trim()) { setError('Titre requis.'); return }
        setLoading(true)
        setError('')
        const formData = new FormData()
        formData.set('title', title)
        formData.set('description', description)
        if (image) formData.set('image', image)
        try {
            const res = await fetch('/api/defis', { method: 'POST', body: formData })
            if (res.ok) {
                setOpen(false)
                router.push('/challenges?success=true')
                router.refresh()
            } else {
                const data = await res.json()
                setError(data.error ?? 'Erreur.')
            }
        } catch (error: unknown) {
            console.error(error)
            setError('Erreur réseau.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <>
            <button className="btn" onClick={() => setOpen(true)}>Proposer un défi</button>

            {open && (
                <div className="dark_filter" style={{ display: 'flex', zIndex: 300 }} onClick={event => event.target === event.currentTarget && setOpen(false)}>
                    <div className="pop_up_container" style={{ display: 'flex', width: 400, padding: 30 }}>
                        <div className="pop_up_header">
                            <h2>Proposer un défi</h2>
                            <button onClick={() => setOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'white', fontSize: '1.5em' }}>✕</button>
                        </div>
                        {error && <p className="message_false_container" style={{ position: 'static', animation: 'none', top: 0 }}>{error}</p>}
                        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16, padding: '0 0 20px' }}>
                            <div className="input_container">
                                <label htmlFor="defi_title">
                                    <span>Titre du défi</span>
                                    <input type="text" id="defi_title" className="input_connexion" value={title}
                                        onChange={event => setTitle(event.target.value)} required />
                                </label>
                            </div>
                            <div className="input_container">
                                <label htmlFor="defi_desc">
                                    <span>Contraintes / description</span>
                                    <textarea id="defi_desc" style={{ background: 'transparent', border: 'none', borderBottom: '1px solid white', color: 'white', width: '100%', minHeight: 80, fontFamily: 'inherit', resize: 'vertical' }}
                                        value={description} onChange={event => setDescription(event.target.value)} />
                                </label>
                            </div>
                            <div className="input_container">
                                <span>Image de couverture</span>
                                <input type="file" accept="image/*" onChange={event => setImage(event.target.files?.[0] ?? null)}
                                    style={{ color: 'white', marginTop: 8 }} />
                            </div>
                            <button type="submit" className="btn" disabled={loading}>
                                {loading ? 'Envoi...' : 'Soumettre'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </>
    )
}
