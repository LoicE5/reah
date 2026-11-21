# Reah

> This project was initially created as a student project, co-engineered with my classmate [Julie](https://github.com/jstm17), originally built in PHP. This repository is a Next.js reboot of that project, hosted on Vercel at [reah-app.vercel.app](https://reah-app.vercel.app/feed). The original PHP codebase needed modernization, which motivated this rewrite.

Reah is a French-language platform for short films (*courts-métrages*) and creative challenges (*défis*). Filmmakers — beginners or seasoned — upload their short films, participate in timed challenges, follow other creators, and engage through likes, comments, and saves.

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, React 19) |
| Language | TypeScript 5 |
| Database | PostgreSQL 18 via Drizzle ORM and node-postgres |
| Auth | iron-session (encrypted cookies) |
| Video hosting | Vimeo API |
| Email | Nodemailer (SMTP) |
| Validation | Zod |
| Package manager | Bun |
| Local DB | Docker / Podman Compose |

## Prerequisites

- [Bun](https://bun.sh) (tested with 1.4)
- [Docker](https://www.docker.com) or [Podman](https://podman.io) with Compose
- A [Vimeo developer app](https://developer.vimeo.com/apps) (Client ID, Client Secret, Access Token)
- An SMTP server or relay (e.g. Mailtrap for development)

## Setup

### 1. Clone and install dependencies

```bash
git clone https://github.com/LoicE5/reah.git
cd reah
bun install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

The database defaults start a local PostgreSQL instance. Set a local session secret and fill in the Vimeo and SMTP settings if you need video uploads or email.

```env
# Database (local defaults)
DATABASE_URL=postgresql://reah_user:reah_password@127.0.0.1:5432/reah_db
POSTGRES_USER=reah_user
POSTGRES_PASSWORD=reah_password
POSTGRES_DB=reah_db
POSTGRES_PORT=5432

# Session — at least 32 random characters
SESSION_SECRET=change_me_to_a_random_32_char_string_here_please

# Vimeo API
VIMEO_CLIENT_ID=
VIMEO_CLIENT_SECRET=
VIMEO_ACCESS_TOKEN=

# Email (SMTP)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
SMTP_FROM="Reah <noreply@reah.fr>"

# App
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 3. Start the database

```bash
bun run db
```

Compose starts PostgreSQL 18 and publishes it on loopback. If you change the local user, password, database, or port, update `DATABASE_URL` to match. With Podman, use `podman compose -f docker/docker-compose.yml --env-file .env up -d`.

### 4. Run migrations and seed (optional)

```bash
# Apply the checked-in migrations
bun run db:migrate

# Reset a disposable local database and insert sample data
bun run db:seed
```

### 5. Start the development server

```bash
bun run dev
```

Open [http://localhost:3000](http://localhost:3000). The root redirects to `/feed`.

## Available scripts

| Command | Description |
|---|---|
| `bun run dev` | Start Next.js development server |
| `bun run build` | Production build |
| `bun run start` | Start production server |
| `bun run lint` | Run ESLint |
| `bun run typecheck` | Check TypeScript types |
| `bun run test:integration` | Run integration tests in a disposable local PostgreSQL cluster |
| `bun run db` | Start the local PostgreSQL container via Docker Compose |
| `bun run docker:run` | Start the standalone app image. Requires a repository-root `.env` and a free port 3000. |
| `bun run db:generate` | Generate Drizzle migration files |
| `bun run db:migrate` | Apply checked-in Drizzle migrations |
| `bun run db:seed` | Reset a local development database and load sample data |

## PostgreSQL on Aiven

Use a PostgreSQL 18 service and configure `DATABASE_URL` with the service URI and `sslmode=verify-full&sslrootcert=/path/to/aiven-ca.pem`. The CA file must be available to both the app and Drizzle Kit. The Compose variables apply to local development.

The app opens connections on demand, caps the pool at one connection per running process, and releases idle connections after five seconds. Aiven Free uses direct connections and allows 20 total connections, including reserved slots. Budget active app processes together with maintenance tools and other clients. Aiven recommends reserving six slots for the service. [Aiven connection limits](https://aiven.io/docs/products/postgresql/reference/pg-connection-limits)

## Migrating existing MySQL data

The PostgreSQL migration starts a new migration history. Apply it to an empty PostgreSQL 18 database. The CSV import script loads an existing MySQL export and advances identity sequences in a single transaction. All ten application tables must be empty. Foreign keys and uniqueness checks stay active. [CSV import script](scripts/import-mysql.sql)

1. From a consistent MySQL snapshot, export all ten application tables as UTF-8 CSV. Name each file after its table and use the header and column order shown in the import script. Include header-only files for empty tables. Rename the `user_CGU` header to `user_cgu` and preserve numeric flags, password hashes, IDs, and textual date and duration values. Use an unquoted empty field for SQL `NULL` and `""` for an empty string. Use standard CSV quoting for commas, quotes, and newlines.
2. Export the MySQL `AUTO_INCREMENT` values into `sequences.csv` with the header `table_name,next_id`. Include `users`, `defis`, `videos`, `comments`, `subscription`, and `password_reset_tokens`. The import resumes each sequence at the greater of the exported counter and the largest imported ID plus one.
3. Keep legacy `DATETIME` values in UTC, or include the correct offset in the export if the source used another timezone. Resolve any MySQL zero dates before importing. Test with an offline copy of the data before scheduling a cutover.
4. With migrations applied, run this from the directory containing the CSV files. Set `DATABASE_URL` for the PostgreSQL target in that shell.

   ```bash
   psql -X --dbname="$DATABASE_URL" --file=/path/to/reah/scripts/import-mysql.sql
   ```

5. Compare row counts and sample relationships, and check login, search, and a generated ID on the rehearsal copy. For cutover, pause MySQL writes before taking the final snapshot and retain it for rollback. Once the application accepts writes on PostgreSQL, a rollback needs to account for those writes.

The schema keeps nullable flags as numbers, stores timestamps as UTC instants, and retains the existing string formats for birthdays, challenge deadlines, and MySQL `TIME` durations. PostgreSQL 18 supports `LIKE` with the ICU collation in the initial migration for case- and accent-insensitive search and account lookup. During rehearsal, check account uniqueness and search behavior against the source collation.

## Integration tests

Put PostgreSQL 18's `initdb`, `pg_ctl`, and `psql` on your PATH and run `bun run test:integration` as a regular user. The suite creates a temporary PostgreSQL cluster with a private Unix socket, applies the migrations, and imports synthetic data.

## Project structure

```
src/
├── app/                    # Next.js App Router pages and API routes
│   ├── admin/              # Admin dashboard
│   ├── api/                # REST API handlers
│   │   ├── admin/          # Admin-only endpoints (users, videos, defis, comments)
│   │   ├── auth/           # Auth endpoints (login, signup, verify-email, …)
│   │   ├── defis/          # Challenge endpoints
│   │   ├── users/          # User endpoints
│   │   └── videos/         # Video endpoints (upload, like, save, comment)
│   ├── challenges/         # Challenges pages
│   ├── feed/               # Main feed page
│   ├── login/              # Login page
│   ├── notifications/      # Notifications page
│   ├── profile/            # User profile pages
│   ├── saved/              # Saved videos page
│   ├── search/             # Search page
│   ├── settings/           # Account settings page
│   └── signup/             # Registration pages (signup, verify-email, …)
├── components/             # Shared React components
├── db/
│   └── schema.ts           # Drizzle ORM table definitions
├── lib/
│   ├── auth.ts             # Password hashing helpers
│   ├── db.ts               # Drizzle client singleton
│   ├── email.ts            # Nodemailer helpers
│   ├── queries.ts          # Reusable DB queries
│   ├── rateLimit.ts        # In-memory rate limiter
│   ├── session.ts          # iron-session helpers
│   ├── validateUpload.ts   # Server-side file validation
│   └── vimeo.ts            # Vimeo SDK wrapper
└── styles/                 # Page-scoped CSS modules
```

## Database schema

| Table | Description |
|---|---|
| `users` | Accounts with email verification and admin flag |
| `sessions` | iron-session token records |
| `defis` | Creative challenges with optional end date |
| `videos` | Short films linked to a Vimeo ID and optional challenge |
| `comments` | Comments on videos |
| `liked` | User ↔ video likes (composite PK) |
| `saved` | User ↔ video saves (composite PK) |
| `subscription` | Follower ↔ creator relationships |
| `distribution` | Video distribution records |
| `password_reset_tokens` | Secure one-time password-reset tokens |

## Features

- **Auth** — registration with email verification, login/logout, forgot password, change password, account suspension
- **Feed** — personalised feed for logged-in users (subscribed creators), latest videos for guests, explore tab
- **Challenges** — timed creative challenges with countdown timers; users can propose new challenges (pending admin validation)
- **Videos** — upload to Vimeo, genre tagging, challenge association, like, save, comment, share
- **Profiles** — public profile with bio, avatar, banner, filmography, subscriber count
- **Search** — case- and accent-insensitive substring search across videos, users, and challenges
- **Notifications** — activity notifications
- **Admin dashboard** — manage users (suspend/delete), videos, challenges (validate/promote), and comments
- **Rate limiting** — in-memory rate limiting on auth endpoints

## License

GNU Affero General Public License v3.0 — see [LICENSE](LICENSE).
