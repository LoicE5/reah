# Changelog

## 1.0.0

Initial public release of Reah using Next.js — a French short-film and creative-challenge platform.

### Added

**Application scaffold**
- Next.js 16 App Router project with React 19 and TypeScript 5
- Montserrat font via `next/font/google`, French locale (`lang="fr"`)
- Page-scoped CSS modules migrated from a single global stylesheet

**Authentication**
- Registration with email-verification code (6-digit, time-limited)
- Login / logout with `iron-session` encrypted cookies (30-day session)
- Forgot-password flow using SHA-256 hashed, single-use reset tokens
- Change-password page (requires current password)
- Resend-verification-code endpoint
- `requireAuth` and `requireAdmin` server-side guards

**Database**
- MySQL 8 schema managed with Drizzle ORM (`drizzle-kit`)
- Tables: `users`, `sessions`, `defis`, `videos`, `comments`, `liked`, `saved`, `subscription`, `distribution`, `password_reset_tokens`
- Docker / Podman Compose setup for local development database
- Seed script for development data

**Feed**
- Three-tab layout: personalised feed (subscribed creators), active challenges, explore
- Guest landing hero section with call-to-action
- Deep-linking via `?tab=` URL parameter
- Graceful offline banner when the database is unreachable

**Challenges (Défis)**
- Challenge listing with current and discoverable sections
- Live countdown timers on each challenge card
- Authenticated users can propose new challenges (subject to admin validation)
- Challenge detail page with associated video submissions

**Videos**
- Upload to Vimeo via the Vimeo SDK; server-side file type and size validation
- Genre tagging and optional challenge association
- Like, save, comment, and share modal
- Video card component with poster image and metadata

**User profiles**
- Public profile page: bio, avatar, banner, filmography grid, subscriber count
- Subscribe / unsubscribe button
- Settings page: edit display name, username, bio, website, profile picture, banner

**Search**
- Full-text search across videos and users (`/search`)

**Notifications**
- Notifications page (`/notifications`)

**Saved**
- Saved-videos page (`/saved`)

**Admin dashboard**
- User management: suspend / unsuspend, delete
- Video management: delete
- Challenge management: validate / invalidate, promote to "current" (sets +1 month end date), delete
- Comment management: delete

**Security**
- Hardened auth flows: rate limiting on login and registration endpoints
- `httpOnly`, `secure`, `sameSite=lax` session cookies
- Server-side upload validation (MIME type, file size)
- Secure HTTP headers via `next.config.ts`
- Password hashing with bcryptjs
- SHA-256 hashed password-reset tokens stored server-side

**Infrastructure**
- GNU AGPLv3 license
- `.env.example` documenting all required environment variables
- ESLint configuration with `eslint-config-next`