# Agent Instructions for Voltbean Tools

## Project overview
- Root project is a Next.js 15.4 app using the App Router and TypeScript.
- The frontend uses server components by default; client interactivity is enabled with `"use client"` at the top of components.
- Prisma is used for database access with SQLite locally. The main schema is under `prisma/schema.prisma`.
- `repo_src/` is a separate nested sample/legacy copy and is excluded from the root TypeScript build; focus first on the root project files.

## Key directories
- `app/`: Next.js pages, layouts, nested routes, and API route handlers.
- `components/`: reusable client and UI components used by app pages.
- `lib/`: shared runtime helpers, Prisma client, auth/session helpers, and type definitions.
- `prisma/`: Prisma schema, seed script, and local database configuration.
- `public/uploads/submissions/`: local file storage for tool submission uploads.
- `data/`: seeded state and admin state data for the app.

## Build and runtime commands
- Install dependencies: `npm install`
- Run development server: `npm run dev`
- Build production output: `npm run build`
- Start production server: `npm start`
- Lint project: `npm run lint`
- Prisma setup: `npm run db:generate`, `npm run db:push`, `npm run db:seed`

## Environment and deployment notes
- Local development uses `.env.local` and `.env.example` for env vars.
- Required runtime envs include `DATABASE_URL`, `AUTH_SECRET`, and production Turnstile/Google auth keys if used.
- `public/uploads/submissions/` is local filesystem storage only; do not assume persistent uploads on serverless deployments.

## Important app conventions
- `app/layout.tsx` wraps the app with `AppProvider`, `Header`, and `Footer`.
- Auth is cookie-based using `lib/auth.ts`; sessions are signed tokens stored in `voltbean_session`.
- `requireRole()` is the canonical server-side role guard for protected pages and routes.
- API routes are implemented as route handlers in `app/api/**/route.ts` using `Request` and `NextResponse`.
- API input validation uses `zod` consistently.
- `lib/db.ts` caches the Prisma client in the global object during development to prevent multiple connections.
- `lib/types.ts` contains shared types such as `Tool`, `Category`, `UserRole`, and `SessionUser`.
- Local dev uses demo auth flows in `app/api/auth/demo/route.ts` and demo user roles `USER`, `DEVELOPER`, `ADMIN`.

## When working in this repo
- Prefer editing root-level files under `app/`, `components/`, `lib/`, and `prisma/`.
- Avoid making changes in `repo_src/` unless the work explicitly targets that separate reference project.
- Preserve the app router and server component boundaries in `app/` pages.
- Keep environment secrets out of client bundles.
- When adding or updating submission storage, respect the local upload path and note that production storage must be external.

## Useful facts for code changes
- The site is a tool discovery platform with categories, saved tools, ratings, deals, submissions, and role-based dashboards.
- Tool records use stringified JSON arrays for fields like `featuresJson`, `prosJson`, `consJson`, `tagsJson`, and `screenshotsJson`.
- The admin path and state flow are implemented through server checks and a separate admin state JSON file.
- There is not currently a test script defined in `package.json`.
