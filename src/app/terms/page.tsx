import { getCurrentUser } from '@/lib/session';
import { db } from '@/lib/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import Nav from '@/components/Nav';
import Footer from '@/components/Footer';
import '@/styles/fil_actu.css';
import '@/styles/cgu.css';

export default async function TermsPage() {
  const session = await getCurrentUser();
  let profilePic = '';
  if (session) {
    const [user] = await db
      .select({ pic: users.user_profile_picture })
      .from(users)
      .where(eq(users.user_id, session.userId))
      .limit(1);
    profilePic = user?.pic ?? '';
  }

  return (
    <main className="main_content">
      <Nav user={session} profilePic={profilePic} />

      <div className="cgu_text">
        <h1>
          <div className="red_line title_line" />
          Bienvenue à toi sur Reah !
        </h1>
        <p>
          Reah c&apos;est un concept unique. Notre objectif est de vous permettre en tant que réalisateurs débutants
          et⸱ou professionnels de partager vos courts-métrages, avec un petit twist. Chez Reah, nous souhaitons
          vous pousser vers l&apos;avant en vous proposant de relever nos défis avec des contraintes filmiques et des
          thèmes de tous les genres. Nous voulons stimuler votre esprit créatif en vous permettant de gagner en
          visibilité en gagnant une médaille sur le podium.
        </p>

        <h1>
          <div className="red_line title_line" />
          Qui peut utiliser Reah ?
        </h1>
        <p id="mentions">
          Pour utiliser Reah, vous devez avoir au moins 16 ans. Vous devez avoir obtenu le consentement de votre
          parent ou tuteur légal, si vous êtes plus jeune.
        </p>

        <h1>
          <div className="red_line title_line" />
          Autorisations et restrictions Générales
        </h1>
        <p>Vous pouvez accéder au service et l&apos;utiliser tel qu&apos;il vous est proposé sous condition de respecter les règles.</p>
        <p>Les restrictions suivantes s&apos;appliquent à votre utilisation du service. Vous n&apos;êtes pas autorisé à :</p>
        <ul>
          <li>vendre, concéder sous licence, altérer, modifier ou utiliser de toute autre façon tout ou partie du Service ou du Contenu sauf si le service vous y a explicitement autorisé, par écrit</li>
          <li>usurper l&apos;identité d&apos;autrui</li>
          <li>accéder au Service par le biais de procédés automatisés (robots)</li>
          <li>recueillir ou utiliser toute information permettant d&apos;identifier une personne</li>
          <li>abuser des options de rapports (signalements, accusations)</li>
          <li>utiliser le Service pour vendre de la publicité.</li>
        </ul>
        <p>Les conditions générales d&apos;utilisation rappellent aux internautes que les éléments du site :</p>
        <ul>
          <li>textes</li>
          <li>vidéos</li>
          <li>images</li>
        </ul>
        <p>sont protégés par le droit d&apos;auteur et que leur utilisation sans autorisation préalable expresse est interdite.</p>

        <h1>
          <div className="red_line title_line" />
          Les conditions générales
        </h1>
        <p>
          Le Service peut inclure des liens vers des sites web tiers qui n&apos;appartiennent pas à Reah. Nous déclinons
          toute responsabilité quant à l&apos;utilisation de ces sites que Reah ne gère pas.
        </p>

        <h2>Le règlement général sur la protection des données</h2>
        <p>Les informations recueillies sur le formulaire d&apos;inscription sont enregistrées dans notre base de données informatisée par nos développeurs pour créer votre profil Reah.</p>
        <p>Les données collectées seront communiquées aux seuls destinataires suivants : Étienne Loïc, Saint Martin Julie, Bassimane Manar, Baillon Edouard et Lad Minal.</p>
        <p>Les données sont conservées jusqu&apos;à la suppression souhaitée par l&apos;utilisateur. En cas d&apos;inactivité pendant 2 ans entraînera la suppression du compte et des données.</p>
        <p>Vous pouvez accéder aux données vous concernant, les rectifier, demander leur effacement ou exercer votre droit à la limitation du traitement de vos données. Vous pouvez retirer à tout moment votre consentement au traitement de vos données ; Vous pouvez également vous opposer au traitement de vos données ; Vous pouvez également exercer votre droit à la portabilité de vos données.</p>
        <p>Consultez le site <a target="_blank" href="https://www.cnil.fr" rel="noreferrer">cnil.fr</a> pour plus d&apos;informations sur vos droits.</p>
        <p>Pour exercer ces droits ou pour toute question sur le traitement de vos données dans ce dispositif, vous pouvez contacter <a target="_blank" href="mailto:contact@reah.fr" className="not_a_link" rel="noreferrer">contact@reah.fr</a>.</p>
        <p>Si vous estimez, après nous avoir contactés, que vos droits « Informatique et Libertés » ne sont pas respectés, vous pouvez adresser une réclamation à la CNIL.</p>

        <h2>COOKIES</h2>
        <p>
          Lorsque vous créez un compte ou vous connectez sur Reah, des Cookies peuvent être déposés sur votre système.
          Ces derniers assurent le bon fonctionnement du site et sont essentiels à une navigation et une expérience utilisateur optimale.
        </p>
        <p>Aucun Cookie ne sera déposé sur votre système sans que :</p>
        <ul>
          <li>Vous ayez créé ou tenté de créer un compte sur la plateforme Reah</li>
          <li>Vous n&apos;ayez été promptement invité à donner votre consentement pour l&apos;utilisation de ces derniers, via une affiche clairement visible vous proposant d&apos;accepter ou de refuser les Cookies, et que vous les ayez explicitement acceptés, conformément à la loi Européenne sur la protection des données (RGPD).</li>
        </ul>

        <h1>
          <div className="red_line title_line" />
          Les conditions générales d&apos;utilisation
        </h1>
        <h2>Droits de l&apos;utilisateur</h2>
        <p>
          Tous les utilisateurs peuvent créer un compte, s&apos;ils souhaitent effectuer les actions suivantes : aimer, commenter, partager, s&apos;abonner.
          En cas d&apos;oubli de mot de passe, l&apos;utilisateur peut demander à le modifier.
          Nous proposons un accès libre aux courts-métrages. Ainsi, toute personne ayant accès à la plateforme peut regarder des courts-métrages, sans avoir l&apos;obligation de créer un compte.
        </p>

        <h2>Vous avez un compte ?</h2>
        <p>Pour la création du compte de l&apos;utilisateur, la collecte des informations au moment de l&apos;inscription sur le site est nécessaire et obligatoire.</p>
        <p>Vous pouvez vous abonner ou bien vous désabonner librement sans aucune notification. Vous pouvez également modifier vos informations personnelles, renseignées lors de votre inscription.</p>
        <p>Vous pouvez supprimer votre compte, ce qui supprimera automatiquement toutes vos données de notre plateforme. Toutes les informations recueillies lors de votre inscription ne sont pas transmises à un tiers. Nous les utilisons uniquement dans le cadre de votre authentification lors de votre connexion sur Reah.</p>

        <h2>Partage des œuvres (courts-métrages)</h2>
        <p>En partageant vos travaux lors de nos défis :</p>
        <ul>
          <li>Vous devez mentionner toutes les personnes ayant participé à sa réalisation.</li>
          <li>Vous acceptez que les utilisateurs partagent vos travaux sur les réseaux sociaux ou d&apos;autres plateformes.</li>
          <li>Reah n&apos;est pas responsable des plagiats et vols concernant vos travaux.</li>
          <li>Vous acceptez que vos travaux soient commentés.</li>
        </ul>

        <h2>Commentaires et partages</h2>
        <p>
          L&apos;espace des commentaires en dessous des travaux est un espace de libre-échange. L&apos;éditeur, notamment, ne sera pas tenu responsable en cas de propos injurieux ou de publication de contenu contrefaisant les droits de propriété intellectuelle d&apos;un tiers.
        </p>
      </div>

      <Footer />
    </main>
  );
}
