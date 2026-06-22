# Voltbean Tools

A modern software discovery platform for finding tools by problem, category, pricing, platform, and use case.

## Included in the MVP

- Intent-aware search with filters and sorting
- 20 seeded tools across 8 categories
- Tool details, ratings, deals, alternatives, and bookmark flows
- Signed, HTTP-only demo sessions with user, developer, and admin roles
- Server-enforced dashboard permissions
- Tool submission and admin approval experiences
- Developer analytics and listing management UI
- Responsive public pages and dashboards
- PostgreSQL + Prisma production schema

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Use the demo access buttons on `/login` to explore each role.

## Google sign-in

1. In Google Cloud Console, create an OAuth 2.0 Client ID for a Web application.
2. Add `http://localhost:3000/api/auth/google/callback` as an authorized redirect URI.
3. Copy `.env.example` to `.env.local` and set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and a strong `AUTH_SECRET`.
4. Restart the development server and use **Continue with Google** on `/login` or `/register`.

For production, set `GOOGLE_REDIRECT_URI` to the same HTTPS callback URL configured in Google Cloud.

## Tool uploads and CAPTCHA

Tool submissions accept one logo (2MB maximum) and up to five screenshots (5MB each) in PNG, JPG, or WebP format. Local uploads are stored under `public/uploads/submissions`.

Cloudflare Turnstile test keys are used automatically during local development. For production, create a Turnstile widget and set:

```env
NEXT_PUBLIC_TURNSTILE_SITE_KEY="your-site-key"
TURNSTILE_SECRET_KEY="your-secret-key"
```

Use persistent object storage such as S3, Cloudflare R2, or Vercel Blob before deploying to a serverless platform, where the local filesystem is temporary.

## Database

The app uses Prisma with SQLite. The local database is stored at `prisma/dev.db`.

1. Copy `.env.example` to `.env`.
2. Set `DATABASE_URL="file:./dev.db"` and use a strong `AUTH_SECRET`.
3. Create the schema and import the included catalog, users, deals, and pending submissions:

```bash
npm run db:generate
npm run db:push
npm run db:seed
```

Public tools, admin state, submissions, approvals, saved tools, and ratings are read from and written to the database. Existing account-specific saved tools in browser storage are imported automatically the next time that user signs in.

Tool visits and outbound website clicks are recorded as activity events. Personal and developer dashboards calculate statistics, activity feeds, and recent traffic charts from those database records.

Use `npx prisma studio` to inspect or edit the local database.

## Security notes

- Session cookies are signed, HTTP-only, SameSite=Lax, and secure in production.
- Role checks run on the server for protected dashboards.
- API payloads are validated with Zod.
- Secrets are read from environment variables and never exposed to client code.
- Password hashing is configured with bcrypt in the database seed.
- Production should add CSRF tokens for state-changing requests, rate limiting, email verification, object storage validation, and a Content Security Policy.
