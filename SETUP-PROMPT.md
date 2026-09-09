# Setup prompt for a fresh machine

Paste everything below the line into Claude Code on the other laptop.

---

Set up this project so it runs locally. Work through it end to end and verify
each step actually worked before moving on — don't just report the commands.

**Repo:** https://github.com/dexter1998/gigzmanclient (private — I'm `dexter1998`
on GitHub; if `gh auth status` isn't logged in as an account with access, tell me
and stop rather than guessing.)

**What this is:** a multi-tenant Next.js 16 App Router site serving several
real-estate client websites off one codebase (Drizzle ORM + Postgres, Tailwind
v4 CSS-first, pnpm). Tenants live under `clients/` as YAML content that gets
seeded into the database.

## Steps

1. `git clone` the repo, then `pnpm install`. The repo pins `pnpm@11.22.0` via
   `packageManager` — use corepack if pnpm isn't present.
2. Run `pnpm setup`. It writes `.env.local` with a freshly generated
   `AUTH_SECRET` and a localhost `DATABASE_URL`. It never overwrites an
   existing file.
3. Get a Postgres database and put its URL in `DATABASE_URL` — see the two
   options below.
4. `pnpm db:migrate` to apply the migrations in `drizzle/`.
5. Seed at least one tenant: `pnpm seed:client high-properties`. Available
   slugs are the directory names under `clients/`: `high-properties`,
   `evergreen-real-estate`, `expert-realtors`, `arora-k-associates`,
   `nayra-realtors`, `urban-flat-real-estate`. `high-properties` and
   `evergreen-real-estate` are the two with full content — seed both.
6. `pnpm dev`, then confirm in a browser (not just curl — this app renders
   client components, and a curl of the RSC payload is misleading):
   - http://localhost:3000/realestate/premium-v2/high-properties
   - http://localhost:3000/realestate/premium-v2/evergreen-real-estate
   Check that listing cards show images and that a couple of inner pages
   (`/properties`, `/localities`, `/tools`) load.

## Database — pick one

**Option A: local Postgres** (simplest for development)

```bash
brew install postgresql@16 && brew services start postgresql@16
createdb gigzman_client_sites
```
Then `DATABASE_URL=postgresql://<your-mac-username>@localhost:5432/gigzman_client_sites`
(no password on a default Homebrew install). `pnpm setup` already guesses this
line — just confirm the username matches.

**Option B: Supabase** (matches production, which runs on a Supabase pooler)

- Create a project at supabase.com, then Project Settings → Database →
  Connection string.
- Use the **Session pooler** or **direct** connection for `pnpm db:migrate`.
  Migrations create types and run DDL, which the transaction pooler on port
  6543 can reject.
- Append `?sslmode=require` to the URL.
- The app's Postgres client already sets `prepare: false` in
  `lib/db/index.ts`, so a transaction-mode pooler works at runtime — no change
  needed there.
- URL-encode the password if it contains `@`, `#`, `/` or `:`, otherwise the
  connection string parses wrong and you'll get a confusing auth error.

## Environment variables

All of these live in `.env.local`, which is gitignored and must stay that way.

| Variable | What to put | Required? |
|---|---|---|
| `DATABASE_URL` | Postgres connection string from the step above. | Yes — nothing runs without it. |
| `AUTH_SECRET` | Signs dashboard session cookies. `pnpm setup` generates one. To make your own: `openssl rand -base64 32`. Must be at least 16 characters. | Yes |
| `TENANT_MODE` | `path` for local development — every tenant is served from one origin at `/{vertical}/{template}/{slug}`. `host` is for a client's own domain and additionally needs `PRIMARY_TENANT_SLUG`. | Yes (`path`) |
| `PLATFORM_ADMIN_EMAIL` | Any email you'll type at the login form. This is env-only auth — there's no admin row in the database, so it does not have to match any other machine. | Optional |
| `PLATFORM_ADMIN_PASSWORD_HASH` | bcrypt hash of a password you choose: `node -e "console.log(require('bcryptjs').hashSync('<password>', 10))"` | Optional |

The two `PLATFORM_ADMIN_*` values only gate the template-library pages (`/`,
`/{vertical}`) and the internal `/admin` deployment index. The client tenant
sites work without them — leave both blank if you don't need those pages.

Do not ask me for production credentials, and do not commit `.env.local`. Every
value above is a local development value you can generate yourself.

## Notes

- If a page shows stale counts or old content after reseeding, it's the cache:
  `unstable_cache` persists into `.next/cache` and survives restarts. Delete
  `.next/cache` and reload.
- `source-data/` holds the vendored inputs the import scripts read. The
  farmhouse importer is `node scripts/import-farmhouses.mjs` and expects to be
  run from the repo root.
- Content in `clients/evergreen-real-estate` is seed/demo content — the
  listings came from public 99acres data and the photography is generated. It
  is not client-approved copy.
