import type { Metadata } from 'next';
import { Montserrat } from 'next/font/google';
import './globals.css';

const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  weight: ['400', '500', '600', '700', '900'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'REAH',
  description: 'La plateforme des courts métrages et défis créatifs.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body
        className={montserrat.variable}
        style={{ fontFamily: 'var(--font-montserrat), Montserrat, sans-serif' }}
      >
        {children}
      </body>
    </html>
  );
}
