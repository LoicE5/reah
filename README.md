# Reah

> This project was initially created as a student project, co-engineered with my classmate [Julie](https://github.com/jstm17), originally built in PHP. This repository is a Next.js reboot of that project, hosted on Vercel at [reah-app.vercel.app](https://reah-app.vercel.app/feed) and powered by [Aiven](https://aiven.io)'s managed MySQL database service. The original PHP codebase needed modernization, which motivated this rewrite.

Reah is a French-language platform for short films (*courts-métrages*) and creative challenges (*défis*). Filmmakers — beginners or seasoned — upload their short films, participate in timed challenges, follow other creators, and engage through likes, comments, and saves.

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, React 19) |
| Language | TypeScript 5 |
| Database | MySQL 8 via Drizzle ORM |
| Auth | iron-session (encrypted cookies) |
| Video hosting | Vimeo API |
| Email | Nodemailer (SMTP) |
| Validation | Zod |
| Package manager | Bun |
| Local DB | Docker / Podman Compose |

## Prerequisites

- [Bun](https://bun.sh) ≥ 1.0
- [Docker](https://www.docker.com) or [Podman](https://podman.io) with Compose
- A [Vimeo developer app](https://developer.vimeo.com/apps) (Client ID, Client Secret, Access Token)
- An SMTP server or relay (e.g. Mailtrap for development)

## Setup

### 1. Clone and install dependencies

```bash
git clone <repo-url>
cd reah-next
bun install
```

### 2. Configure environment variables

```bash
cp .env.example .env
```

Edit `.env` and fill in all values:

```env
# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=reah_user
DB_PASSWORD=reah_password
DB_NAME=reah_db
DB_ROOT_PASSWORD=root_password_change_me

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

This starts a MySQL 8 container using the credentials from `.env`.

### 4. Run migrations and seed (optional)

```bash
# Generate and apply migrations
bun run db:migrate

# Seed with sample data (development only)
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
| `bun run db` | Start MySQL container via Compose |
| `bun run db:generate` | Generate Drizzle migration files |
| `bun run db:migrate` | Generate and apply migrations |
| `bun run db:seed` | Seed the database with sample data |

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
│   └── schema.ts           # Drizzle ORM schema (single source of truth)
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
- **Search** — full-text search across videos and users
- **Notifications** — activity notifications
- **Admin dashboard** — manage users (suspend/delete), videos, challenges (validate/promote), and comments
- **Rate limiting** — in-memory rate limiting on auth endpoints

## License

GNU Affero General Public License v3.0 — see [LICENSE](LICENSE).
