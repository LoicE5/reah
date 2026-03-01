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

import mysql from 'mysql2/promise';
import { drizzle } from 'drizzle-orm/mysql2';
import { sql } from 'drizzle-orm';
import bcrypt from 'bcryptjs';
import * as schema from '@/db/schema';

const {
  users, defis, videos, comments,
  liked, saved, subscription,
} = schema;

// ---------------------------------------------------------------------------
// Connection — standalone (no pool / globalThis guard needed in a script)
// ---------------------------------------------------------------------------
const conn = await mysql.createConnection({
  host:     process.env.DB_HOST     ?? 'localhost',
  port:     Number(process.env.DB_PORT ?? 3306),
  user:     process.env.DB_USER     ?? 'reah_user',
  password: process.env.DB_PASSWORD ?? 'reah_password',
  database: process.env.DB_NAME     ?? 'reah_db',
});

const db = drizzle(conn, { schema, mode: 'default' });

// ---------------------------------------------------------------------------
// Reset — truncate in safe order (FK checks off)
// ---------------------------------------------------------------------------
console.log('🗑  Clearing tables...');
await conn.execute('SET FOREIGN_KEY_CHECKS = 0');
for (const table of [
  'distribution', 'subscription', 'saved', 'liked',
  'comments', 'videos', 'defis', 'sessions', 'users',
]) {
  try {
    await conn.execute(`TRUNCATE TABLE \`${table}\``);
  } catch (e: unknown) {
    if ((e as { code?: string }).code === 'ER_NO_SUCH_TABLE') {
      console.error(`\n❌ Table "${table}" not found. Run migrations first:\n   bun run db:migrate\n`);
      await conn.end();
      process.exit(1);
    }
    throw e;
  }
}
await conn.execute('SET FOREIGN_KEY_CHECKS = 1');

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const hash = (p: string) => bcrypt.hashSync(p, 10);

function daysFromNow(n: number) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  // MySQL DATETIME as string
  return d.toISOString().slice(0, 19).replace('T', ' ');
}

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------
console.log('👤 Inserting users...');

const [{ insertId: adminId }] = await db.insert(users).values({
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
  user_bio:       'Compte administrateur de la plateforme REAH.',
});

const [{ insertId: aliceId }] = await db.insert(users).values({
  user_username:  'alice',
  user_email:     'alice@example.com',
  user_password:  hash('Alice1234!'),
  user_lastname:  'Lemaire',
  user_firstname: 'Alice',
  user_birthday:  '15/06/1998',
  user_status:    1,
  user_cgu:       1,
  user_name:      'Alice Lemaire',
  user_bio:       'Cinéaste passionnée par les courts-métrages.',
});

const [{ insertId: bobId }] = await db.insert(users).values({
  user_username:  'bob',
  user_email:     'bob@example.com',
  user_password:  hash('Bob12345!'),
  user_lastname:  'Durand',
  user_firstname: 'Bob',
  user_birthday:  '22/03/1995',
  user_status:    1,
  user_cgu:       1,
  user_name:      'Bob Durand',
  user_bio:       'Réalisateur indépendant basé à Lyon.',
});

const [{ insertId: charlieId }] = await db.insert(users).values({
  user_username:  'charlie',
  user_email:     'charlie@example.com',
  user_password:  hash('Charlie1!'),
  user_lastname:  'Martin',
  user_firstname: 'Charlie',
  user_birthday:  '08/11/2000',
  user_status:    1,
  user_cgu:       1,
  user_name:      'Charlie Martin',
  user_bio:       'Étudiant en cinéma, fan de Kubrick.',
});

// ---------------------------------------------------------------------------
// Defis
// ---------------------------------------------------------------------------
console.log('🎬 Inserting defis...');

const [{ insertId: defi1Id }] = await db.insert(defis).values({
  defi_name:        'Défi #1 — 60 secondes',
  defi_description: 'Réalisez un court-métrage de 60 secondes maximum sur le thème de la solitude urbaine.',
  defi_user_id:     adminId,
  defi_verified:    1,
  defi_current:     1,
  defi_date_end:    daysFromNow(30),
});

const [{ insertId: defi2Id }] = await db.insert(defis).values({
  defi_name:        'Défi #2 — Lumière naturelle',
  defi_description: 'Tournez sans éclairage artificiel. Exploitez la lumière naturelle sous toutes ses formes.',
  defi_user_id:     adminId,
  defi_verified:    1,
  defi_current:     0,
  defi_date_end:    daysFromNow(-7),
});

// ---------------------------------------------------------------------------
// Videos
// ---------------------------------------------------------------------------
console.log('🎥 Inserting videos...');

// Public Vimeo demo video — replace with real IDs once actual uploads happen.
const DEMO_VIMEO = '148751763';

const [{ insertId: v1Id }] = await db.insert(videos).values({
  video_url:      DEMO_VIMEO,
  video_vimeo_id: DEMO_VIMEO,
  video_title:    'La Rue Silencieuse',
  video_user_id:  aliceId,
  video_synopsis: "Un personnage déambule dans les rues vides à l'aube, seul face à la ville endormie.",
  video_genre:    'Drame',
  video_defi_id:  defi1Id,
  video_duration: '00:01:00',
});

const [{ insertId: v2Id }] = await db.insert(videos).values({
  video_url:      DEMO_VIMEO,
  video_vimeo_id: DEMO_VIMEO,
  video_title:    'Fenêtre sur Cour',
  video_user_id:  bobId,
  video_synopsis: 'Depuis sa fenêtre, un homme observe la vie des voisins. Court-métrage intimiste.',
  video_genre:    'Drame',
  video_defi_id:  defi1Id,
  video_duration: '00:00:58',
});

const [{ insertId: v3Id }] = await db.insert(videos).values({
  video_url:      DEMO_VIMEO,
  video_vimeo_id: DEMO_VIMEO,
  video_title:    "L'Heure Bleue",
  video_user_id:  charlieId,
  video_synopsis: 'Une balade entre chien et loup, filmée entièrement à la lumière naturelle du crépuscule.',
  video_genre:    'Documentaire',
  video_defi_id:  defi2Id,
  video_duration: '00:02:30',
});

const [{ insertId: v4Id }] = await db.insert(videos).values({
  video_url:      DEMO_VIMEO,
  video_vimeo_id: DEMO_VIMEO,
  video_title:    'Instantanés',
  video_user_id:  aliceId,
  video_synopsis: 'Série de vignettes visuelles sans dialogue. Influence Koyaanisqatsi.',
  video_genre:    'Expérimental',
  video_duration: '00:03:12',
});

const [{ insertId: v5Id }] = await db.insert(videos).values({
  video_url:      DEMO_VIMEO,
  video_vimeo_id: DEMO_VIMEO,
  video_title:    'Retour de Marché',
  video_user_id:  bobId,
  video_synopsis: 'Une grand-mère rentre du marché. Tranche de vie douce-amère.',
  video_genre:    'Comédie',
  video_duration: '00:01:45',
});

await db.insert(videos).values({
  video_url:      DEMO_VIMEO,
  video_vimeo_id: DEMO_VIMEO,
  video_title:    'Carnet de Voyage',
  video_user_id:  charlieId,
  video_synopsis: 'Impressions de voyages captées au quotidien, montées en rythme.',
  video_genre:    'Documentaire',
  video_duration: '00:04:00',
});

// ---------------------------------------------------------------------------
// Likes (+ keep video_like_number in sync atomically)
// ---------------------------------------------------------------------------
console.log('🍿 Inserting likes...');

const likeRows: [number, number][] = [
  [bobId, v1Id], [charlieId, v1Id], [adminId, v1Id],
  [aliceId, v2Id], [charlieId, v2Id],
  [aliceId, v3Id], [bobId, v3Id], [adminId, v3Id],
  [bobId, v4Id],
  [aliceId, v5Id], [charlieId, v5Id],
];

for (const [userId, videoId] of likeRows) {
  await db.insert(liked).values({ liked_user_id: userId, liked_video_id: videoId });
  await db.update(videos)
    .set({ video_like_number: sql`${videos.video_like_number} + 1` })
    .where(sql`video_id = ${videoId}`);
}

// ---------------------------------------------------------------------------
// Saves
// ---------------------------------------------------------------------------
console.log('🔖 Inserting saves...');

await db.insert(saved).values([
  { saved_user_id: aliceId,   saved_video_id: v2Id },
  { saved_user_id: aliceId,   saved_video_id: v3Id },
  { saved_user_id: bobId,     saved_video_id: v4Id },
  { saved_user_id: charlieId, saved_video_id: v1Id },
  { saved_user_id: charlieId, saved_video_id: v5Id },
]);

// ---------------------------------------------------------------------------
// Subscriptions
// ---------------------------------------------------------------------------
console.log('👥 Inserting subscriptions...');

await db.insert(subscription).values([
  { subscription_subscriber_id: aliceId,   subscription_artist_id: bobId     },
  { subscription_subscriber_id: aliceId,   subscription_artist_id: charlieId },
  { subscription_subscriber_id: bobId,     subscription_artist_id: aliceId   },
  { subscription_subscriber_id: bobId,     subscription_artist_id: charlieId },
  { subscription_subscriber_id: charlieId, subscription_artist_id: aliceId   },
  { subscription_subscriber_id: adminId,   subscription_artist_id: aliceId   },
  { subscription_subscriber_id: adminId,   subscription_artist_id: bobId     },
]);

// ---------------------------------------------------------------------------
// Comments
// ---------------------------------------------------------------------------
console.log('💬 Inserting comments...');

await db.insert(comments).values([
  { comment_content: "Superbe atmosphère, j'adore la photographie !", comment_video_id: v1Id, comment_user_id: bobId     },
  { comment_content: 'Le montage son est vraiment travaillé.',           comment_video_id: v1Id, comment_user_id: charlieId },
  { comment_content: 'Wow, magnifique rendu avec la lumière naturelle !', comment_video_id: v3Id, comment_user_id: aliceId  },
  { comment_content: "J'aurais aimé quelques minutes de plus.",           comment_video_id: v3Id, comment_user_id: adminId  },
  { comment_content: 'Très poétique, bravo !',                            comment_video_id: v4Id, comment_user_id: bobId    },
  { comment_content: 'La musique colle parfaitement aux images.',         comment_video_id: v2Id, comment_user_id: aliceId  },
  { comment_content: 'Court mais intense, bien joué.',                    comment_video_id: v2Id, comment_user_id: charlieId},
  { comment_content: 'La grand-mère est touchante, belle performance.',   comment_video_id: v5Id, comment_user_id: aliceId  },
]);

// ---------------------------------------------------------------------------
await conn.end();

console.log('\n✅ Seed complete!\n');
console.log('  Users created:');
console.log('    admin    / Admin1234!  (admin)');
console.log('    alice    / Alice1234!');
console.log('    bob      / Bob12345!');
console.log('    charlie  / Charlie1!');
