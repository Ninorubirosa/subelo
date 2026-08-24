# Artist Auth Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship Subelo's own passwordless (magic-link) artist signup/login, independent of SonoSuite, as the foundation every artist-facing feature builds on.

**Architecture:** Auth.js (next-auth v5) wired into the Next.js App Router, using its Prisma adapter against the existing SQLite DB, with a single Email provider whose delivery goes through a custom Resend-backed send function. JWT sessions embed `artistId` via callbacks. On a user's first-ever signin, an `Artist` row is created automatically and idempotently.

**Tech Stack:** Next.js 16 (App Router), next-auth v5 beta (Auth.js), @auth/prisma-adapter, Prisma + SQLite, Vitest (new — no test runner exists in this repo yet), native `fetch` for the Resend REST API (no SDK dependency needed).

**Spec:** `docs/superpowers/specs/2026-08-24-artist-auth-foundation-design.md`

## Global Constraints

- Passwordless only — no passwords are ever stored or hashed in this pass.
- Exactly one `Artist` per `User` (enforced via a unique FK + idempotent upsert), for v1. Label/multi-artist accounts are explicitly out of scope.
- Sessions use the JWT strategy, not database sessions.
- Signin rate limiting is explicitly deferred — not part of this plan.
- Google OAuth is explicitly deferred — not part of this plan, but the schema (Auth.js's standard `Account` model) already supports adding it later with zero migration.
- `next-auth` is currently pinned at `^4.24.11` in `package.json` but has **zero usage anywhere in `src/`** — this plan upgrades it to v5 (Auth.js) as its first dependency change, since v5 is what the App Router patterns below require and nothing in the codebase depends on v4's API.

---

### Task 1: Add the Vitest test runner

Nothing in this repo has a test runner yet. Every later task in this plan depends on `npm test` working, so this is isolated first.

**Files:**
- Create: `vitest.config.ts`
- Create: `tests/sanity.test.ts`
- Modify: `package.json`

**Interfaces:**
- Produces: `npm test` runs Vitest once (`vitest run`), used by every later task.

- [ ] **Step 1: Install Vitest**

```bash
npm install --save-dev vitest@4.1.11
```

- [ ] **Step 2: Create the Vitest config**

Create `vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
  },
})
```

- [ ] **Step 3: Add the `test` script**

In `package.json`, add to `"scripts"`:

```json
"test": "vitest run"
```

- [ ] **Step 4: Write a sanity test**

Create `tests/sanity.test.ts`:

```typescript
import { describe, expect, it } from 'vitest'

describe('vitest setup', () => {
  it('runs', () => {
    expect(1 + 1).toBe(2)
  })
})
```

- [ ] **Step 5: Run it and confirm it passes**

Run: `npm test`
Expected: 1 test file, 1 test, PASS.

- [ ] **Step 6: Commit**

```bash
git add package.json package-lock.json vitest.config.ts tests/sanity.test.ts
git commit -m "test: add Vitest test runner"
```

---

### Task 2: Extend the Prisma schema for Auth.js + link Artist to User

Adds the four models Auth.js's Prisma adapter requires (`Account`, `Session`, `VerificationToken`, plus new fields on `User`), and links the existing `Artist` model to `User` for the first time — today they have no relation at all.

**Files:**
- Modify: `prisma/schema.prisma`

**Interfaces:**
- Produces: `Artist.userId` (unique FK to `User.id`) — every later task that creates or queries an `Artist` from a `User` relies on this exact field name.

- [ ] **Step 1: Update the `User` model**

In `prisma/schema.prisma`, replace:

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

with:

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  emailVerified DateTime?
  image         String?
  name          String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  accounts      Account[]
  sessions      Session[]
  artist        Artist?
}
```

- [ ] **Step 2: Add the Auth.js adapter models**

Add to `prisma/schema.prisma` (SQLite has no `@db.Text`, unlike the Postgres examples in Auth.js's docs — every field here is a plain `String?`):

```prisma
model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String
  expires    DateTime

  @@unique([identifier, token])
}
```

- [ ] **Step 3: Link `Artist` to `User`**

In `prisma/schema.prisma`, find the existing `Artist` model:

```prisma
model Artist {
  id          String   @id @default(cuid())
  name        String
  avatarUrl   String?
  genre       String?
  monthlyListeners Int @default(0)
  totalStreams Int @default(0)
  createdAt   DateTime @default(now())
  releases    Release[]
}
```

Add a `userId` field and the relation (keep every existing field as-is):

```prisma
model Artist {
  id          String   @id @default(cuid())
  userId      String   @unique
  user        User     @relation(fields: [userId], references: [id])
  name        String
  avatarUrl   String?
  genre       String?
  monthlyListeners Int @default(0)
  totalStreams Int @default(0)
  createdAt   DateTime @default(now())
  releases    Release[]
}
```

- [ ] **Step 4: Validate the schema**

Run: `npx prisma validate`
Expected: `The schema at prisma/schema.prisma is valid 🚀`

- [ ] **Step 5: Run the migration**

```bash
npx prisma migrate dev --name add_auth_and_artist_link
```

This will prompt about the existing seeded `Artist` rows lacking a `userId` (the column is required and unique). Since the current seed data (`scripts/seed.ts`) is demo/marketing data with no real users behind it, accept resetting the dev database when prompted — it can be reseeded with `npx prisma db seed` if needed for the marketing dashboard demo afterward.

- [ ] **Step 6: Regenerate the Prisma client**

Run: `npx prisma generate`
Expected: completes with no errors — the generated `Artist` type now includes `userId`, and `User` includes `accounts`/`sessions`/`artist`.

- [ ] **Step 7: Commit**

```bash
git add prisma/schema.prisma prisma/migrations
git commit -m "feat: extend schema for Auth.js adapter, link Artist to User"
```

---

### Task 3: `createArtistForUser` — idempotent Artist creation

The function that guarantees "every `User` has exactly one `Artist`," called from Auth.js's `createUser` event in Task 5. Built and tested standalone here so it doesn't depend on Auth.js's event system to verify.

**Files:**
- Create: `src/lib/create-artist-for-user.ts`
- Test: `tests/lib/create-artist-for-user.test.ts`

**Interfaces:**
- Consumes: `PrismaClient` (from `@prisma/client`)
- Produces: `createArtistForUser(prisma: PrismaClient, userId: string): Promise<Artist>` — Task 5's `events.createUser` calls this exact function with this exact signature.

- [ ] **Step 1: Write the failing test**

Create `tests/lib/create-artist-for-user.test.ts`:

```typescript
import { PrismaClient } from '@prisma/client'
import path from 'node:path'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createArtistForUser } from '@/lib/create-artist-for-user'

const testDbPath = path.join(process.cwd(), 'prisma', 'test.db')
const prisma = new PrismaClient({ datasourceUrl: `file:${testDbPath}` })

beforeAll(async () => {
  await prisma.artist.deleteMany()
  await prisma.user.deleteMany()
})

afterAll(async () => {
  await prisma.$disconnect()
})

describe('createArtistForUser', () => {
  it('creates one Artist for a new User, derived from their email', async () => {
    const user = await prisma.user.create({
      data: { email: 'nova@example.com' },
    })

    const artist = await createArtistForUser(prisma, user.id)

    expect(artist.userId).toBe(user.id)
    expect(artist.name).toBe('nova')
  })

  it('is idempotent — calling it twice never creates a duplicate Artist', async () => {
    const user = await prisma.user.create({
      data: { email: 'echo@example.com' },
    })

    await createArtistForUser(prisma, user.id)
    await createArtistForUser(prisma, user.id)

    const count = await prisma.artist.count({ where: { userId: user.id } })
    expect(count).toBe(1)
  })
})
```

- [ ] **Step 2: Point the test DB at a pushed schema**

```bash
DATABASE_URL="file:$(pwd)/prisma/test.db" npx prisma db push --skip-generate --accept-data-loss
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `npm test -- tests/lib/create-artist-for-user.test.ts`
Expected: FAIL — `Cannot find module '@/lib/create-artist-for-user'`.

- [ ] **Step 4: Write the implementation**

Create `src/lib/create-artist-for-user.ts`:

```typescript
import type { Artist, PrismaClient } from '@prisma/client'

export async function createArtistForUser(
  prisma: PrismaClient,
  userId: string
): Promise<Artist> {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } })
  const defaultName = user.email.split('@')[0]

  return prisma.artist.upsert({
    where: { userId },
    update: {},
    create: {
      userId,
      name: defaultName,
    },
  })
}
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `npm test -- tests/lib/create-artist-for-user.test.ts`
Expected: 2 tests PASS.

- [ ] **Step 6: Add the test DB files to `.gitignore`**

Append to `.gitignore`:

```
# prisma test db
prisma/test.db
prisma/test.db-journal
```

- [ ] **Step 7: Commit**

```bash
git add src/lib/create-artist-for-user.ts tests/lib/create-artist-for-user.test.ts .gitignore
git commit -m "feat: add idempotent createArtistForUser"
```

---

### Task 4: `sendMagicLinkEmail` — branded email via Resend's REST API

The function Auth.js's Email provider calls to actually deliver the signin link. Built and tested standalone against a mocked `fetch`, decoupled from Auth.js's request/response plumbing.

**Files:**
- Create: `src/lib/send-magic-link-email.ts`
- Test: `tests/lib/send-magic-link-email.test.ts`

**Interfaces:**
- Produces: `sendMagicLinkEmail(params: { to: string; url: string }): Promise<void>` — Task 5's provider config calls this exact function with this exact signature. Throws if the Resend API call fails.

- [ ] **Step 1: Write the failing test**

Create `tests/lib/send-magic-link-email.test.ts`:

```typescript
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { sendMagicLinkEmail } from '@/lib/send-magic-link-email'

describe('sendMagicLinkEmail', () => {
  beforeEach(() => {
    vi.stubEnv('AUTH_RESEND_KEY', 'test-key')
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it('POSTs the link to Resend with the right recipient and auth header', async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 200 }))

    await sendMagicLinkEmail({
      to: 'nova@example.com',
      url: 'https://subelodistro.com/api/auth/callback/resend?token=abc',
    })

    expect(fetch).toHaveBeenCalledWith(
      'https://api.resend.com/emails',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer test-key',
          'Content-Type': 'application/json',
        }),
      })
    )

    const body = JSON.parse(vi.mocked(fetch).mock.calls[0][1]!.body as string)
    expect(body.to).toBe('nova@example.com')
    expect(body.html).toContain('https://subelodistro.com/api/auth/callback/resend?token=abc')
  })

  it('throws when the Resend API responds with an error', async () => {
    vi.mocked(fetch).mockResolvedValue(new Response('bad request', { status: 400 }))

    await expect(
      sendMagicLinkEmail({ to: 'nova@example.com', url: 'https://example.com' })
    ).rejects.toThrow()
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- tests/lib/send-magic-link-email.test.ts`
Expected: FAIL — `Cannot find module '@/lib/send-magic-link-email'`.

- [ ] **Step 3: Write the implementation**

Create `src/lib/send-magic-link-email.ts`:

```typescript
export async function sendMagicLinkEmail({
  to,
  url,
}: {
  to: string
  url: string
}): Promise<void> {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.AUTH_RESEND_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Subelo <no-reply@subelodistro.com>',
      to,
      subject: 'Sign in to Subelo',
      html: `
        <div style="font-family: sans-serif; background: #09090b; color: #fafafa; padding: 32px;">
          <h1 style="color: #38B6FF; font-size: 20px;">Sign in to Subelo</h1>
          <p>Click the link below to sign in. This link expires in 24 hours.</p>
          <p><a href="${url}" style="color: #38B6FF;">Sign in to Subelo</a></p>
          <p style="color: #a1a1aa; font-size: 13px;">If you didn't request this, you can ignore this email.</p>
        </div>
      `,
      text: `Sign in to Subelo: ${url}`,
    }),
  })

  if (!res.ok) {
    throw new Error(`Resend API error: ${res.status} ${await res.text()}`)
  }
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- tests/lib/send-magic-link-email.test.ts`
Expected: 2 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/send-magic-link-email.ts tests/lib/send-magic-link-email.test.ts
git commit -m "feat: add branded magic-link email sender"
```

---

### Task 5: Wire Auth.js — upgrade to v5, configure, session callbacks

Brings Tasks 2–4 together into a working `auth.ts`. This is config/wiring, not independently unit-testable business logic, so it ends in a manual server check instead of a red/green cycle.

**Files:**
- Modify: `package.json` (next-auth v4 → v5 beta, add `@auth/prisma-adapter`)
- Create: `src/auth.ts`
- Create: `src/app/api/auth/[...nextauth]/route.ts`
- Create: `src/types/next-auth.d.ts`
- Modify: `.env` (document new required vars — do not commit real secret values)

**Interfaces:**
- Consumes: `createArtistForUser` from Task 3, `sendMagicLinkEmail` from Task 4, `db` from `src/lib/db.ts`.
- Produces: `auth`, `handlers`, `signIn`, `signOut` exported from `@/auth`, for future Server Component/Server Action use. Task 6's login page is a client component, so it imports the client-safe `signIn` from `next-auth/react` instead — a separate export, not this one.

- [ ] **Step 1: Upgrade next-auth and add the Prisma adapter**

```bash
npm install next-auth@5.0.0-beta.32 @auth/prisma-adapter@2.11.3
```

- [ ] **Step 2: Generate an AUTH_SECRET**

```bash
npx auth secret
```

This writes `AUTH_SECRET` to `.env.local`. Confirm it's there:

```bash
grep AUTH_SECRET .env.local
```

- [ ] **Step 3: Add the module type augmentation**

Create `src/types/next-auth.d.ts`:

```typescript
import type { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session {
    user: {
      artistId: string
    } & DefaultSession['user']
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    artistId?: string
  }
}
```

- [ ] **Step 4: Write `src/auth.ts`**

```typescript
import NextAuth from 'next-auth'
import Resend from 'next-auth/providers/resend'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { db } from '@/lib/db'
import { createArtistForUser } from '@/lib/create-artist-for-user'
import { sendMagicLinkEmail } from '@/lib/send-magic-link-email'

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: 'jwt' },
  pages: {
    error: '/login/error',
  },
  providers: [
    Resend({
      apiKey: process.env.AUTH_RESEND_KEY,
      from: 'Subelo <no-reply@subelodistro.com>',
      sendVerificationRequest: async ({ identifier, url }) => {
        await sendMagicLinkEmail({ to: identifier, url })
      },
    }),
  ],
  events: {
    createUser: async ({ user }) => {
      if (user.id) {
        await createArtistForUser(db, user.id)
      }
    },
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) {
        const artist = await db.artist.findUnique({ where: { userId: user.id } })
        if (artist) {
          token.artistId = artist.id
        }
      }
      return token
    },
    async session({ session, token }) {
      if (token.artistId) {
        session.user.artistId = token.artistId
      }
      return session
    },
  },
})
```

- [ ] **Step 5: Add the route handler**

Create `src/app/api/auth/[...nextauth]/route.ts`:

```typescript
export { GET, POST } from '@/auth'
```

- [ ] **Step 6: Document the new env vars**

Append to `.env` (values left blank/placeholder — this file is gitignored per the existing `.env*` rule):

```
# Resend API key for magic-link auth emails (see Task 5 of the auth foundation plan)
AUTH_RESEND_KEY=
```

- [ ] **Step 7: Manual verification**

```bash
npm run dev
```

In another terminal:

```bash
curl -s http://localhost:3000/api/auth/providers
```

Expected: JSON response listing the `resend` provider (no server error/stack trace). Stop the dev server after confirming.

- [ ] **Step 8: Commit**

```bash
git add package.json package-lock.json src/auth.ts src/app/api/auth src/types/next-auth.d.ts .env
git commit -m "feat: wire Auth.js with Resend magic-link provider"
```

---

### Task 6: `/login` page and friendly error page

The user-facing surface for everything above.

**Files:**
- Create: `src/app/login/page.tsx`
- Create: `src/app/login/error/page.tsx`

**Interfaces:**
- Consumes: `signIn` from `@/auth` (Task 5).

- [ ] **Step 1: Write the login page**

Create `src/app/login/page.tsx`:

```tsx
'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')
    const result = await signIn('resend', { email, redirect: false })
    setStatus(result?.error ? 'error' : 'sent')
  }

  if (status === 'sent') {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background text-foreground px-4">
        <div className="max-w-sm text-center">
          <h1 className="text-2xl font-bold mb-2">Check your inbox</h1>
          <p className="text-muted-foreground">
            We sent a sign-in link to {email}. It expires in 24 hours.
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-background text-foreground px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-6 text-center">Sign in to Subelo</h1>
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full rounded-md border border-border bg-surface px-4 py-2 mb-3 text-sm"
        />
        <Button type="submit" className="w-full" disabled={status === 'sending'}>
          {status === 'sending' ? 'Sending…' : 'Send me a link'}
        </Button>
        {status === 'error' && (
          <p className="mt-3 text-sm text-destructive">
            Something went wrong sending your link. Please try again.
          </p>
        )}
      </form>
    </main>
  )
}
```

- [ ] **Step 2: Write the error page**

Create `src/app/login/error/page.tsx`:

```tsx
import Link from 'next/link'

export default function LoginErrorPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background text-foreground px-4">
      <div className="max-w-sm text-center">
        <h1 className="text-2xl font-bold mb-2">Link expired</h1>
        <p className="text-muted-foreground mb-6">
          That sign-in link is no longer valid. Request a new one below.
        </p>
        <Link href="/login" className="text-lime underline">
          Back to sign in
        </Link>
      </div>
    </main>
  )
}
```

- [ ] **Step 3: Manual verification**

```bash
npm run dev
```

Visit `http://localhost:3000/login`, submit an email address, confirm the page transitions to the "Check your inbox" state without a console error. (Actual email delivery can't be verified until Resend's domain is set up — see the note below.)

- [ ] **Step 4: Commit**

```bash
git add src/app/login
git commit -m "feat: add login page and auth error page"
```

---

## After this plan

- **Manual, one-time setup outside this codebase** (not scriptable): sign up for Resend, verify `subelodistro.com`'s SPF/DKIM records, generate an API key, and set `AUTH_RESEND_KEY` in Vercel's environment variables (and locally in `.env`). Magic links won't actually deliver until this is done, even though every task above is code-complete without it.
- Fast-follows explicitly deferred by the spec: Google OAuth, signin rate limiting.
- Next spec in the sequence: catalog/upload sync (subsystem #2) — depends on this plan's `session.user.artistId` being available.
