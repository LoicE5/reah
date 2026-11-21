/**
 * REAH database seed script — run with: bun run db:seed
 * Requires the DB to be running (bun run db).
 *
 * Truncates all tables then inserts:
 *   - 1 admin user  (admin / Admin1234!)
 *   - 3 regular users (alice, bob, charlie)
 *   - 2 verified defis (1 current, 1 past)
 *   - 6 sample videos spread across users & defis
 *   - likes, saves, subscriptions, comments
 */

import { eq, sql } from 'drizzle-orm'
import bcrypt from 'bcryptjs'
import { users, defis, videos, comments, liked, saved, subscription } from '@/db/schema'
import type { DatabaseTransaction } from '@/lib/db'

function hash(password: string): string {
  return bcrypt.hashSync(password, 10)
}

function daysFromNow(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return date.toISOString().slice(0, 19).replace('T', ' ')
}

const databaseUrl = process.env.DATABASE_URL
if (!databaseUrl || !URL.canParse(databaseUrl)) {
  throw new Error('Set a valid DATABASE_URL. See .env.example for local defaults.')
}
const url = new URL(databaseUrl)
if (process.env.NODE_ENV === 'production' || !['postgres:', 'postgresql:'].includes(url.protocol)
  || !['127.0.0.1', 'localhost', '[::1]'].includes(url.hostname) || url.pathname.length <= 1 || url.search) {
  throw new Error('Seeding requires a local development DATABASE_URL without connection options.')
}

const { db } = await import('@/lib/db')

async function seed(transaction: DatabaseTransaction): Promise<void> {
  console.info('🗑  Clearing tables...')
  await transaction.execute(sql`
    truncate table distribution, subscription, saved, liked, comments, videos,
      defis, sessions, password_reset_tokens, users restart identity
  `)

  console.info('👤 Inserting users...')

  const [{ id: adminId }] = await transaction.insert(users).values({
    user_username:  'admin',
    user_email:     'admin@reah.fr',
    user_password:  hash('Admin1234!'),
    user_lastname:  'Admin',
    user_firstname: 'REAH',
    user_birthday:  '01/01/1990',
    user_status:    1,
    user_cgu:       1,
    user_admin:     1,
    user_name:      'REAH Admin',
    user_bio:       'Compte administrateur de la plateforme REAH.'
  }).returning({ id: users.user_id })

  const [{ id: aliceId }] = await transaction.insert(users).values({
    user_username:  'alice',
    user_email:     'alice@example.com',
    user_password:  hash('Alice1234!'),
    user_lastname:  'Lemaire',
    user_firstname: 'Alice',
    user_birthday:  '15/06/1998',
    user_status:    1,
    user_cgu:       1,
    user_name:      'Alice Lemaire',
    user_bio:       'Cinéaste passionnée par les courts-métrages.'
  }).returning({ id: users.user_id })

  const [{ id: bobId }] = await transaction.insert(users).values({
    user_username:  'bob',
    user_email:     'bob@example.com',
    user_password:  hash('Bob12345!'),
    user_lastname:  'Durand',
    user_firstname: 'Bob',
    user_birthday:  '22/03/1995',
    user_status:    1,
    user_cgu:       1,
    user_name:      'Bob Durand',
    user_bio:       'Réalisateur indépendant basé à Lyon.'
  }).returning({ id: users.user_id })

  const [{ id: charlieId }] = await transaction.insert(users).values({
    user_username:  'charlie',
    user_email:     'charlie@example.com',
    user_password:  hash('Charlie1!'),
    user_lastname:  'Martin',
    user_firstname: 'Charlie',
    user_birthday:  '08/11/2000',
    user_status:    1,
    user_cgu:       1,
    user_name:      'Charlie Martin',
    user_bio:       'Étudiant en cinéma, fan de Kubrick.'
  }).returning({ id: users.user_id })

  // Defis
  console.info('🎬 Inserting defis...')

  const [{ id: defi1Id }] = await transaction.insert(defis).values({
    defi_name:        'Défi #1 — 60 secondes',
    defi_description: 'Réalisez un court-métrage de 60 secondes maximum sur le thème de la solitude urbaine.',
    defi_user_id:     adminId,
    defi_verified:    1,
    defi_current:     1,
    defi_date_end:    daysFromNow(30)
  }).returning({ id: defis.defi_id })

  const [{ id: defi2Id }] = await transaction.insert(defis).values({
    defi_name:        'Défi #2 — Lumière naturelle',
    defi_description: 'Tournez sans éclairage artificiel. Exploitez la lumière naturelle sous toutes ses formes.',
    defi_user_id:     adminId,
    defi_verified:    1,
    defi_current:     0,
    defi_date_end:    daysFromNow(-7)
  }).returning({ id: defis.defi_id })

  // Videos
  console.info('🎥 Inserting videos...')

  // Public Vimeo demo video — replace with real IDs once actual uploads happen.
  const DEMO_VIMEO = '148751763'

  const [{ id: video1Id }] = await transaction.insert(videos).values({
    video_url:      DEMO_VIMEO,
    video_vimeo_id: DEMO_VIMEO,
    video_title:    'La Rue Silencieuse',
    video_user_id:  aliceId,
    video_synopsis: "Un personnage déambule dans les rues vides à l'aube, seul face à la ville endormie.",
    video_genre:    'Drame',
    video_defi_id:  defi1Id,
    video_duration: '00:01:00'
  }).returning({ id: videos.video_id })

  const [{ id: video2Id }] = await transaction.insert(videos).values({
    video_url:      DEMO_VIMEO,
    video_vimeo_id: DEMO_VIMEO,
    video_title:    'Fenêtre sur Cour',
    video_user_id:  bobId,
    video_synopsis: 'Depuis sa fenêtre, un homme observe la vie des voisins. Court-métrage intimiste.',
    video_genre:    'Drame',
    video_defi_id:  defi1Id,
    video_duration: '00:00:58'
  }).returning({ id: videos.video_id })

  const [{ id: video3Id }] = await transaction.insert(videos).values({
    video_url:      DEMO_VIMEO,
    video_vimeo_id: DEMO_VIMEO,
    video_title:    "L'Heure Bleue",
    video_user_id:  charlieId,
    video_synopsis: 'Une balade entre chien et loup, filmée entièrement à la lumière naturelle du crépuscule.',
    video_genre:    'Documentaire',
    video_defi_id:  defi2Id,
    video_duration: '00:02:30'
  }).returning({ id: videos.video_id })

  const [{ id: video4Id }] = await transaction.insert(videos).values({
    video_url:      DEMO_VIMEO,
    video_vimeo_id: DEMO_VIMEO,
    video_title:    'Instantanés',
    video_user_id:  aliceId,
    video_synopsis: 'Série de vignettes visuelles sans dialogue. Influence Koyaanisqatsi.',
    video_genre:    'Expérimental',
    video_duration: '00:03:12'
  }).returning({ id: videos.video_id })

  const [{ id: video5Id }] = await transaction.insert(videos).values({
    video_url:      DEMO_VIMEO,
    video_vimeo_id: DEMO_VIMEO,
    video_title:    'Retour de Marché',
    video_user_id:  bobId,
    video_synopsis: 'Une grand-mère rentre du marché. Tranche de vie douce-amère.',
    video_genre:    'Comédie',
    video_duration: '00:01:45'
  }).returning({ id: videos.video_id })

  await transaction.insert(videos).values({
    video_url:      DEMO_VIMEO,
    video_vimeo_id: DEMO_VIMEO,
    video_title:    'Carnet de Voyage',
    video_user_id:  charlieId,
    video_synopsis: 'Impressions de voyages captées au quotidien, montées en rythme.',
    video_genre:    'Documentaire',
    video_duration: '00:04:00'
  })

  // Likes (+ keep video_like_number in sync atomically)
  console.info('🍿 Inserting likes...')

  const likeRows: [number, number][] = [
    [bobId, video1Id], [charlieId, video1Id], [adminId, video1Id],
    [aliceId, video2Id], [charlieId, video2Id],
    [aliceId, video3Id], [bobId, video3Id], [adminId, video3Id],
    [bobId, video4Id],
    [aliceId, video5Id], [charlieId, video5Id]
  ]

  for (const [userId, videoId] of likeRows) {
    await transaction.insert(liked).values({ liked_user_id: userId, liked_video_id: videoId })
    await transaction.update(videos)
      .set({ video_like_number: sql`${videos.video_like_number} + 1` })
      .where(eq(videos.video_id, videoId))
  }

  // Saves
  console.info('🔖 Inserting saves...')

  await transaction.insert(saved).values([
    { saved_user_id: aliceId,   saved_video_id: video2Id },
    { saved_user_id: aliceId,   saved_video_id: video3Id },
    { saved_user_id: bobId,     saved_video_id: video4Id },
    { saved_user_id: charlieId, saved_video_id: video1Id },
    { saved_user_id: charlieId, saved_video_id: video5Id }
  ])

  // Subscriptions
  console.info('👥 Inserting subscriptions...')

  await transaction.insert(subscription).values([
    { subscription_subscriber_id: aliceId,   subscription_artist_id: bobId     },
    { subscription_subscriber_id: aliceId,   subscription_artist_id: charlieId },
    { subscription_subscriber_id: bobId,     subscription_artist_id: aliceId   },
    { subscription_subscriber_id: bobId,     subscription_artist_id: charlieId },
    { subscription_subscriber_id: charlieId, subscription_artist_id: aliceId   },
    { subscription_subscriber_id: adminId,   subscription_artist_id: aliceId   },
    { subscription_subscriber_id: adminId,   subscription_artist_id: bobId     }
  ])

  // Comments
  console.info('💬 Inserting comments...')

  await transaction.insert(comments).values([
    { comment_content: "Superbe atmosphère, j'adore la photographie !", comment_video_id: video1Id, comment_user_id: bobId     },
    { comment_content: 'Le montage son est vraiment travaillé.',           comment_video_id: video1Id, comment_user_id: charlieId },
    { comment_content: 'Wow, magnifique rendu avec la lumière naturelle !', comment_video_id: video3Id, comment_user_id: aliceId  },
    { comment_content: "J'aurais aimé quelques minutes de plus.",           comment_video_id: video3Id, comment_user_id: adminId  },
    { comment_content: 'Très poétique, bravo !',                            comment_video_id: video4Id, comment_user_id: bobId    },
    { comment_content: 'La musique colle parfaitement aux images.',         comment_video_id: video2Id, comment_user_id: aliceId  },
    { comment_content: 'Court mais intense, bien joué.',                    comment_video_id: video2Id, comment_user_id: charlieId},
    { comment_content: 'La grand-mère est touchante, belle performance.',   comment_video_id: video5Id, comment_user_id: aliceId  }
  ])

}

try {
  await db.transaction(seed)
} finally {
  await db.$client.end()
}

console.info('\n✅ Seed complete!\n')
console.info('  Users created:')
console.info('    admin    / Admin1234!  (admin)')
console.info('    alice    / Alice1234!')
console.info('    bob      / Bob12345!')
console.info('    charlie  / Charlie1!')
