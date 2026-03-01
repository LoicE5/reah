import '@/styles/footer.css'
import Link from 'next/link'

export default function Footer() {
    return (
        <footer>
            <div className="section1">
                <Link className="footer_reah_logo" href="/feed" aria-label="REAH" />

                <div className="about">
                    <p><b>À propos</b></p>
                    <Link href="/terms">REAH</Link>
                    <Link href="/terms#mentions">Mentions légales</Link>
                </div>

                <div className="nav">
                    <p><b>Navigation</b></p>
                    <Link href="/feed">Accueil</Link>
                    <Link href="/feed">Fil d&apos;actualité</Link>
                    <Link href="/challenges">Défis</Link>
                    <Link href="/settings">Paramètres</Link>
                    <Link href="/login">Connexion</Link>
                </div>

                <div className="social">
                    <p><b>Suivez-nous !</b></p>
                    <a href="https://www.linkedin.com/company/reah" target="_blank" rel="noopener noreferrer">
                        <div className="linkedin_logo" />
                        <p>Linkedin</p>
                    </a>
                    <a href="https://www.instagram.com/reahfr/" target="_blank" rel="noopener noreferrer">
                        <div className="insta_logo" />
                        <p>Instagram</p>
                    </a>
                </div>

                <div className="contact">
                    <p><b>Contactez-nous !</b></p>
                    <p><a href="mailto:contact@reah.fr" className="not_a_link">contact@reah.fr</a></p>
                </div>
            </div>

            <div className="section2">
                <p>©2026 REAH. Tous droits réservés</p>
            </div>
        </footer>
    )
}
