# Subelo Music

Marketing/landing site for Subelo Music, a music distribution platform (positioned as an alternative to DistroKid/TuneCore). It's a single-page Next.js site with a hero, platform logos, feature comparison, pricing, testimonials, FAQ, and a live analytics dashboard preview that pulls seeded data from a Prisma/SQLite database (artists, releases, per-platform status, and earnings).

## Tech stack

- **Framework:** Next.js 16 (App Router, React 19)
- **Styling:** Tailwind CSS 4, shadcn/ui (Radix primitives), Framer Motion
- **Data:** Prisma ORM + SQLite
- **Charts:** Recharts
- **Other:** React Hook Form + Zod, TanStack Query/Table, Zustand

## Environment variables

- `DATABASE_URL` — SQLite connection string used by Prisma (e.g. `file:./db/custom.db`)

## Local development

```bash
# install dependencies
bun install   # or npm install

# generate the Prisma client and push the schema to the SQLite db
bun run db:push

# (optional) seed sample artists/releases/earnings data
bun scripts/seed.ts

# start the dev server (http://localhost:3000)
bun run dev
```

Other useful scripts:

- `db:generate` — regenerate the Prisma client
- `db:migrate` — create/apply a Prisma migration
- `db:reset` — reset the database
- `build` / `start` — production build and standalone server start
- `lint` — run ESLint
