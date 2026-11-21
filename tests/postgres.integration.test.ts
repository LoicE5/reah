import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { join, resolve } from 'node:path'
import { after, before, test } from 'node:test'
import { eq } from 'drizzle-orm'
import { migrate } from 'drizzle-orm/node-postgres/migrator'
import { comments, defis, distribution, liked, passwordResetTokens, saved, sessions, users, videos } from '@/db/schema'
import { hashResetToken, verifyPassword } from '@/lib/auth'

const migration = resolve('scripts/import-mysql.sql')
const resetToken = 'synthetic-password-reset-token'
const expiresAt = new Date(Math.floor(Date.now() / 1000) * 1000 + 60 * 60 * 1000)

let db: typeof import('@/lib/db').db
let workDirectory: string
let clusterDirectory: string
let postgresStarted = false

function writeCsv(file: string, header: string, rows: (string | number | null)[][]): void {
  const records = rows.map((row: (string | number | null)[]) => row.map(
    (value: string | number | null) => value === null ? '' : '"' + String(value).replaceAll('"', '""') + '"'
  ).join(','))
  writeFileSync(join(workDirectory, file + '.csv'), [header, ...records].join('\n') + '\n')
}

function writeLegacyExport(): void {
  writeCsv('users', 'user_id,user_username,user_email,user_password,user_lastname,user_firstname,user_birthday,user_status,user_cgu,user_email_verify,user_email_verify_expires,user_suspended,user_admin,user_profile_picture,user_banner,user_name,user_website,user_bio', [
    [40, 'Émilie', 'emilie@example.test', 'synthetic-hash', null, null, '15/06/1998', 0, 1, '012345', expiresAt.toISOString(), 0, 1, '', null, null, null, 'Cinéaste, "Lyon"\nFrance'],
    [42, 'Rémi', 'remi@example.test', 'synthetic-hash', null, null, null, 1, null, null, null, null, 0, '', '', '', '', null]
  ])
  writeCsv('defis', 'defi_id,defi_name,defi_description,defi_timestamp,defi_image,defi_user_id,defi_verified,defi_current,defi_date_end', [
    [50, 'Défi été', null, '2024-06-01 10:11:12', null, 40, 1, 1, '2024-06-30 23:59:59']
  ])
  writeCsv('videos', 'video_id,video_url,video_vimeo_id,video_title,video_user_id,video_synopsis,video_poster,video_genre,video_defi_id,video_duration,video_like_number,video_date,video_report_id', [
    [60, '0012345', '/videos/0012345', 'Été à Lyon', 42, null, '', null, 50, '-125:30:00', null, '2024-06-01 10:11:12', null]
  ])
  writeCsv('comments', 'comment_id,comment_content,comment_video_id,comment_user_id,comment_date,comment_report_id', [
    [70, 'Sans date', 60, 42, null, null],
    [71, 'Avec date', 60, 42, '2024-06-02 15:00:00', null]
  ])
  writeCsv('distribution', 'distribution_user_id,distribution_video_id', [[40, 60]])
  writeCsv('liked', 'liked_user_id,liked_video_id', [[40, 60]])
  writeCsv('saved', 'saved_user_id,saved_video_id', [[40, 60]])
  writeCsv('sessions', 'sessions_userid,sessions_token,sessions_serial,sessions_date', [[40, 'synthetic', 'synthetic', null]])
  writeCsv('subscription', 'subscription_id,subscription_subscriber_id,subscription_artist_id', [[80, 40, 42]])
  writeCsv('password_reset_tokens', 'id,user_id,token_hash,expires_at,used_at,created_at', [
    [90, 42, hashResetToken(resetToken).toUpperCase(), expiresAt.toISOString(), null, '2024-06-01 10:11:12']
  ])
  writeCsv('sequences', 'table_name,next_id', [
    ['users', 200], ['defis', 51], ['videos', 61], ['comments', 72], ['subscription', 81], ['password_reset_tokens', 91]
  ])
}

before(async () => {
  workDirectory = mkdtempSync('/tmp/reah-pg-')
  clusterDirectory = join(workDirectory, 'cluster')

  // The test server accepts connections only through its private Unix socket.
  execFileSync('initdb', ['-D', clusterDirectory, '-A', 'trust', '-U', 'reah_test', '--no-locale', '-E', 'UTF8', '--no-sync'])
  execFileSync('pg_ctl', [
    '-D', clusterDirectory, '-l', join(workDirectory, 'postgres.log'),
    '-o', `-h '' -k ${workDirectory}`, '-t', '15', '-w', 'start'
  ])
  postgresStarted = true

  const url = new URL('postgresql://reah_test:synthetic@localhost:5432/postgres?sslmode=disable')
  url.searchParams.set('host', workDirectory)
  process.env.DATABASE_URL = url.href
  process.env.SESSION_SECRET = 'reah-synthetic-integration-session-secret'
  process.env.CRON_SECRET = 'reah-synthetic-integration-cron-secret'
  const database = await import('@/lib/db')
  db = database.db

  await migrate(db, { migrationsFolder: 'drizzle' })
  writeLegacyExport()
  execFileSync('psql', ['-X', '-h', workDirectory, '-p', '5432', '-U', 'reah_test', '-d', 'postgres', '--file', migration], {
    cwd: workDirectory,
    env: { PATH: process.env.PATH, NODE_ENV: 'test' }
  })
})

after(async () => {
  try {
    await db?.$client.end()
  } finally {
    try {
      if (postgresStarted) execFileSync('pg_ctl', ['-D', clusterDirectory, '-m', 'fast', '-w', 'stop'])
    } finally {
      if (workDirectory) rmSync(workDirectory, { recursive: true, force: true })
    }
  }
})

test('imports legacy IDs, nullable flags, text values and UTC timestamps', async () => {
  const [user] = await db.select().from(users).where(eq(users.user_username, 'EMILIE'))
  assert.equal(user.user_id, 40)
  assert.equal(user.user_status, 0)
  assert.equal(user.user_cgu, 1)
  assert.equal(user.user_admin, 1)
  assert.equal(user.user_birthday, '15/06/1998')
  assert.equal(user.user_email_verify, '012345')
  assert.equal(user.user_email_verify_expires?.toISOString(), expiresAt.toISOString())
  assert.equal(user.user_profile_picture, '')
  assert.equal(user.user_banner, null)
  assert.equal(user.user_bio, 'Cinéaste, "Lyon"\nFrance')
  const [otherUser] = await db.select().from(users).where(eq(users.user_id, 42))
  assert.equal(otherUser.user_cgu, null)

  const [challenge] = await db.select().from(defis).where(eq(defis.defi_id, 50))
  assert.equal(challenge.defi_date_end, '2024-06-30 23:59:59')
  assert.equal(challenge.defi_timestamp?.toISOString(), '2024-06-01T10:11:12.000Z')

  const [video] = await db.select().from(videos).where(eq(videos.video_id, 60))
  assert.equal(video.video_duration, '-125:30:00')
  assert.equal(video.video_url, '0012345')
  assert.equal(video.video_like_number, null)
  assert.equal(video.video_date?.toISOString(), '2024-06-01T10:11:12.000Z')
})

test('resumes identities at the exported counter and enforces legacy uniqueness', async () => {
  const [user] = await db.insert(users).values({
    user_username: 'Nouveau',
    user_email: 'nouveau@example.test',
    user_password: 'synthetic-hash'
  }).returning()
  assert.equal(user.user_id, 200)
  assert.equal(user.user_cgu, 0)

  const [challenge] = await db.insert(defis).values({ defi_name: 'Nouveau défi' }).returning()
  assert.equal(challenge.defi_id, 51)
  assert.equal(challenge.defi_current, 0)
  assert.ok(challenge.defi_timestamp instanceof Date)

  const [comment] = await db.insert(comments).values({ comment_content: 'Nouveau' }).returning()
  assert.equal(comment.comment_id, 72)

  const duplicates = [
    { user_username: 'EMILIE', user_email: 'duplicate@example.test' },
    { user_username: 'Duplicate', user_email: 'EMILIE@EXAMPLE.TEST' }
  ]
  for (const duplicate of duplicates) {
    const rows = await db.insert(users).values({ ...duplicate, user_password: 'synthetic-hash' })
      .onConflictDoNothing().returning()
    assert.deepEqual(rows, [])
  }
})

test('preserves the source primary keys for distributions and sessions', async () => {
  const duplicateDistribution = await db.insert(distribution)
    .values({ distribution_user_id: 40, distribution_video_id: 60 })
    .onConflictDoNothing().returning()
  assert.deepEqual(duplicateDistribution, [])

  const duplicateSession = await db.insert(sessions)
    .values({ sessions_userid: 42, sessions_token: 'SYNTHETIC', sessions_serial: 'different-serial' })
    .onConflictDoNothing().returning()
  assert.deepEqual(duplicateSession, [])
})

test('searches case- and accent-insensitively and keeps feed counts numeric', async () => {
  const { GET: search } = await import('@/app/api/search/route')
  const { getCurrentDefis, getExploreVideos, getSubscribedFeed, getSavedVideos } = await import('@/lib/queries')
  const response = await search(new Request('http://localhost/api/search?q=ete'))
  assert.equal(response.status, 200)
  const results = await response.json()
  assert.equal(results.videos[0].video_id, 60)
  assert.equal(results.defis[0].defi_id, 50)

  const accountSearch = await search(new Request('http://localhost/api/search?q=eMILIE'))
  assert.equal((await accountSearch.json()).users[0].user_id, 40)
  assert.deepEqual((await getCurrentDefis()).map(row => row.defi_id), [50])
  assert.deepEqual((await getExploreVideos(1)).map(row => row.video_id), [60])
  const [video] = await getSubscribedFeed(40)
  assert.equal(video.commentCount, 2)
  assert.equal(video.video_like_number, 0)
  assert.deepEqual(await getSavedVideos(40), [video])

  const { GET: getComments } = await import('@/app/api/videos/[id]/comments/route')
  const commentResponse = await getComments(new Request('http://localhost'), { params: Promise.resolve({ id: '60' }) })
  assert.deepEqual((await commentResponse.json()).map((row: { comment_id: number }) => row.comment_id), [71, 70])
})

test('verifies email expiry and consumes imported reset tokens', async () => {
  const { POST: verifyEmail } = await import('@/app/api/auth/verify-email/route')
  const { POST: changePassword } = await import('@/app/api/auth/change-password/route')

  function verification() {
    return verifyEmail(new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({ email: 'EMILIE@EXAMPLE.TEST', code: '012345' })
    }))
  }
  await db.update(users).set({ user_email_verify_expires: new Date(0) }).where(eq(users.user_id, 40))
  assert.equal((await verification()).status, 400)

  await db.update(users).set({ user_email_verify_expires: expiresAt }).where(eq(users.user_id, 40))
  assert.equal((await verification()).status, 200)
  const [verified] = await db.select().from(users).where(eq(users.user_id, 40))
  assert.equal(verified.user_status, 1)
  assert.equal(verified.user_email_verify_expires, null)

  function reset() {
    return changePassword(new Request('http://localhost', {
      method: 'POST',
      body: JSON.stringify({ mode: 'reset', token: resetToken, newPassword: 'SyntheticPass1' })
    }))
  }
  assert.equal((await reset()).status, 200)
  assert.equal((await reset()).status, 400)
  const [user] = await db.select().from(users).where(eq(users.user_id, 42))
  assert.ok(await verifyPassword('SyntheticPass1', user.user_password))
})

test('preserves foreign-key cascades and challenge owners become null', async () => {
  await db.delete(users).where(eq(users.user_id, 40))
  assert.deepEqual(await db.select().from(sessions), [])
  assert.deepEqual(await db.select().from(liked), [])
  assert.deepEqual(await db.select().from(saved), [])
  const [challenge] = await db.select().from(defis).where(eq(defis.defi_id, 50))
  assert.equal(challenge.defi_user_id, null)

  await db.delete(defis).where(eq(defis.defi_id, 50))
  const [video] = await db.select().from(videos).where(eq(videos.video_id, 60))
  assert.equal(video.video_defi_id, null)

  await db.delete(users).where(eq(users.user_id, 42))
  assert.deepEqual(await db.select().from(videos), [])
  assert.deepEqual(await db.select().from(comments).where(eq(comments.comment_video_id, 60)), [])
  assert.deepEqual(await db.select().from(passwordResetTokens), [])
})

test('database keepalive uses the same bounded connection pool', async () => {
  const { GET: keepalive } = await import('@/app/api/cron/db-keepalive/route')
  const request = new Request('http://localhost/api/cron/db-keepalive', {
    headers: { authorization: 'Bearer reah-synthetic-integration-cron-secret' }
  })
  const response = await keepalive(request)
  assert.equal(response.status, 200)
  assert.equal((await response.json()).ok, true)
  assert.equal(db.$client.totalCount, 1)
})
