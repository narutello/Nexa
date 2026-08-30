# Nexa

**Quiet conversations, kept between you.**

Nexa is a private real-time messenger built for people, not audiences. One-to-one threads, light presence and typing indicators, read receipts — and private chats that stay private, even from admins.

**Live:** [https://nexa-seven-alpha.vercel.app](https://nexa-seven-alpha.vercel.app)

---

## Features

### Auth
- Email / password sign-up and sign-in (Better Auth)
- Optional OAuth (e.g. Grok provider) via environment variables
- Session cookies and server-side session verification

### Profiles
- Auto-created profile on first login
- Display name + unique handle
- Colored avatar hue
- Roles: `USER` · `ADMIN` · `OWNER` (first registered user becomes OWNER)
- Account status: active · warned · suspended · banned

### Chat (1:1)
- Inbox with conversation previews and unread counts
- Search users by handle or display name
- Start a private thread with any user
- Text messages (up to 4 000 characters)
- Pagination for inbox and message history
- Read receipts (delivered / read)
- Typing indicators
- Presence (online / last seen, ~45s window)
- Periodic state sync

### Reporting
- Report a user, conversation, or specific messages
- Reasons: harassment, hate, threats, spam, scam, sexual, impersonation, other
- Frozen **evidence snapshots** (up to 5 messages) — admins only see this evidence, not full private threads

### Admin panel (`/admin`)
- List and resolve reports
- Search and inspect users
- Moderate: warn · suspend · ban · reactivate
- Moderation action log
- Audit log
- OWNER can promote / demote admins and suspend admins

### Security & limits
- Server-side auth on all app APIs
- Rate limiting (profile, search, messaging, …)
- Suspended / banned users are blocked from chat (restricted screen)
- Private message content is not exposed wholesale to moderators

---

## Stack

| Layer | Tech |
|--------|------|
| Framework | [TanStack Start](https://tanstack.com/start) (React + Nitro) |
| Router / data | TanStack Router · TanStack Query |
| Auth | [Better Auth](https://www.better-auth.com/) |
| Database | Postgres (Neon) · PGLite fallback for local |
| UI | React 19 · Tailwind CSS 4 · Radix UI |
| Validation | Zod |
| Deploy | Vercel |

---

## Project structure

```text
src/
  components/nexa/     # Inbox, thread, settings, report UI, …
  components/ui/       # Shared UI primitives
  lib/auth/            # Better Auth server + client
  lib/nexa/            # Chat, profile, reports, admin, rate limits
  lib/db.ts            # Postgres / PGLite SQL helper
  routes/              # File-based routes (app, admin, login, …)
migrations/
  0001_auth.sql        # Better Auth tables (user, session, account, verification)
  0002_nexa.sql        # App schema (profiles, conversations, messages, …)
scripts/
  migrate.mjs          # Applies pending SQL migrations to DATABASE_URL
```

---

## Local development

### Requirements
- Node.js 20+ (22 / 24 recommended)
- npm

### Setup

```bash
git clone https://github.com/narutello/Nexa.git
cd Nexa
npm install
```

### Environment variables

Create a `.env` (or use your host’s env UI). Minimum for a real Postgres:

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Prod | Postgres connection string (use **pooled** URL on Vercel/Neon) |
| `BETTER_AUTH_SECRET` | Prod | Long random secret for signing sessions |
| `BETTER_AUTH_URL` | Prod | Public app URL, e.g. `https://your-app.vercel.app` |
| `VITE_AUTH_ENABLED` | Optional | Set `true` to force auth UI on |
| `GROK_AUTH_ISSUER` | Optional | OAuth issuer URL |
| `GROK_AUTH_CLIENT_ID` | Optional | OAuth client id |
| `GROK_AUTH_CLIENT_SECRET` | Optional | OAuth client secret |

Without `DATABASE_URL`, the app falls back to **PGLite** (in-memory / local file) and applies migrations on startup — fine for quick local demos, not for production.

### Run

```bash
npm run dev
# → http://localhost:8080
```

### Other scripts

```bash
npm run build        # Vite build + db:migrate
npm run db:migrate   # Apply pending migrations to DATABASE_URL
npm run typecheck
npm test
npm run lint
```

---

## Database migrations

Migrations live in `migrations/` and are the source of truth for schema.

- **`npm run build`** runs `db:migrate` against `DATABASE_URL` when set.
- Applied files are recorded in `_migrations` and never re-run.
- On Vercel, if you deploy **prebuilt** output (`.vercel/output`), the migrate step may not run. In that case apply SQL once in the [Neon SQL Editor](https://console.neon.tech):
  1. Contents of `migrations/0001_auth.sql`
  2. Contents of `migrations/0002_nexa.sql`

---

## Deploy on Vercel

1. Import the GitHub repo into Vercel (framework: TanStack Start).
2. Add a Postgres database (Neon integration or external).
3. Set environment variables (**without** accidental prefixes):
   - `DATABASE_URL` — pooled Neon URL
   - `BETTER_AUTH_SECRET` — random string (≥ 32 chars)
   - `BETTER_AUTH_URL` — production domain (`https://….vercel.app`)
4. Deploy.
5. If tables are missing, run both migration SQL files in Neon SQL Editor, then reload the app.

**Production checklist**

- [ ] `DATABASE_URL` points at Neon (pooled)
- [ ] Auth tables + Nexa tables exist
- [ ] `BETTER_AUTH_URL` matches the public origin (avoids “Invalid origin”)
- [ ] Redeploy after changing env vars

---

## App routes

| Path | Description |
|------|-------------|
| `/` | Landing |
| `/register` | Create account |
| `/login` | Sign in |
| `/app` | Authenticated shell (inbox) |
| `/app/$conversationId` | Thread |
| `/admin` | Admin home (ADMIN / OWNER) |
| `/admin/reports` | Report queue |
| `/admin/users` | User moderation |
| `/admin/actions` | Moderation actions |
| `/admin/audit` | Audit log |
| `/admin/admins` | Admin management (OWNER) |
| `/api/auth/*` | Better Auth HTTP handlers |

---

## Roles & privacy model

| Role | Capabilities |
|------|----------------|
| **USER** | Chat, search, report, edit own profile |
| **ADMIN** | Review reports (evidence only), moderate users, view logs |
| **OWNER** | Everything ADMIN can do + manage admins |

Admins do **not** get free access to private conversations. Reporting freezes a small evidence window; that is the only message content moderators can read.

---

## Tech notes

- Server functions use TanStack Start `createServerFn` + `authMiddleware`.
- Email/password is toggled in `src/lib/auth/email-password.ts` (`emailAndPasswordEnabled`).
- Prefer snake_case for app tables; Better Auth tables keep quoted camelCase columns as generated.
- Dependency `tslib` is required at runtime by some Radix packages on Vercel — keep it in `dependencies`.

---

## License

Private project (`"private": true` in `package.json`). All rights reserved unless otherwise stated by the repository owner.

---

Built with TanStack Start · Better Auth · Neon · Vercel
