'use client';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const isDbDown = error.message?.includes('ECONNREFUSED') || error.cause?.toString().includes('ECONNREFUSED');

  return (
    <main style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', gap: 16, padding: 20, textAlign: 'center' }}>
      <div style={{ fontSize: 48 }}>⚠️</div>
      <h1 style={{ color: '#d60036', margin: 0 }}>
        {isDbDown ? 'Service indisponible' : 'Une erreur est survenue'}
      </h1>
      <p style={{ color: '#888', maxWidth: 400 }}>
        {isDbDown
          ? 'La base de données est actuellement hors ligne. Veuillez réessayer dans quelques instants.'
          : 'Quelque chose s\'est mal passé. Veuillez réessayer.'}
      </p>
      <button
        className="btn"
        onClick={reset}
        style={{ marginTop: 8 }}
      >
        Réessayer
      </button>
    </main>
  );
}
