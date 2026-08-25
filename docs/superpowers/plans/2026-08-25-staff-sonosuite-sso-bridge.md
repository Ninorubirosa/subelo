# Staff SonoSuite SSO Bridge Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let an allowlisted Subelo staff member click one link in a
minimal internal `/admin` page and land inside the real SonoSuite backend,
already authenticated via a signed SSO handoff — no new dashboard, no data
mirrored into Subelo, no new staff-permissions model.

**Architecture:** `/admin` is gated server-side by checking the existing
Auth.js session's email against a `STAFF_EMAILS` allowlist (env var, no
schema change). The page's one link hits a Route Handler that
independently re-checks the allowlist, signs a short-lived JWT with `jose`
(already a transitive dependency via Auth.js v5), and 302-redirects to
SonoSuite's login URL with the token attached. A second, trivial Route
Handler is registered as SonoSuite's own logout-redirect target.

**Tech Stack:** Next.js 16 App Router, Auth.js v5 (`@/auth`), `jose` for
JWT signing, Vitest.

**Spec:** `docs/superpowers/specs/2026-08-25-staff-sonosuite-sso-design.md`

## Global Constraints

- No new npm dependencies — `jose` is already present (`^6.0.6`, confirmed
  installed via Auth.js v5's own dependency tree).
- No Prisma schema changes. Staff identity is `STAFF_EMAILS`, a
  comma-separated env var, not a database table.
- Every staff-gated surface re-checks `isStaffEmail` independently — the
  `/admin` page's gate and the `/admin/sonosuite-redirect` route's gate are
  separate checks, not one shared middleware, so a leaked/bookmarked direct
  link to the redirect endpoint is still safe on its own.
- SSO redirect is a plain `GET`, not `POST` — same-origin navigation from a
  link the staff member already had to be authenticated-and-allowlisted to
  see, not a state-changing action, so no CSRF token is needed.
- JWT expiry is fixed at 60 seconds (`exp` - `iat` = 60), signed `HS256`,
  payload `{ email }`, using `SONOSUITE_SSO_SECRET`. This is a documented
  assumption pending confirmation against SonoSuite's real SSO spec (open
  unknown, recorded in the spec) — do not change it while implementing this
  plan; if SonoSuite's real protocol differs, that's a follow-up change
  scoped to `sonosuite-sso.ts` alone.
- Email comparisons in `isStaffEmail` are case-insensitive.
- Artists never see `/admin` — it is not linked from any artist-facing
  page. A non-staff authenticated session hitting it directly gets a plain
  "Not authorized" message, not a redirect that hides the denial.

---

### Task 1: Staff email allowlist check

**Files:**
- Create: `src/lib/is-staff.ts`
- Test: `tests/lib/is-staff.test.ts`

**Interfaces:**
- Produces: `isStaffEmail(email: string | null | undefined): boolean` —
  used by Task 3 (redirect route) and Task 4 (admin page).

- [ ] **Step 1: Write the failing tests**

```ts
// tests/lib/is-staff.test.ts
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { isStaffEmail } from '@/lib/is-staff'

describe('isStaffEmail', () => {
  const original = process.env.STAFF_EMAILS

  beforeEach(() => {
    process.env.STAFF_EMAILS = 'staff@subelo.com, Other@Example.com'
  })

  afterEach(() => {
    process.env.STAFF_EMAILS = original
  })

  it('returns true for an allowlisted email', () => {
    expect(isStaffEmail('staff@subelo.com')).toBe(true)
  })

  it('is case-insensitive', () => {
    expect(isStaffEmail('OTHER@example.com')).toBe(true)
  })

  it('returns false for an email not on the allowlist', () => {
    expect(isStaffEmail('artist@example.com')).toBe(false)
  })

  it('returns false for null and undefined', () => {
    expect(isStaffEmail(null)).toBe(false)
    expect(isStaffEmail(undefined)).toBe(false)
  })

  it('returns false when STAFF_EMAILS is unset', () => {
    process.env.STAFF_EMAILS = ''
    expect(isStaffEmail('staff@subelo.com')).toBe(false)
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/lib/is-staff.test.ts`
Expected: FAIL with "Cannot find module '@/lib/is-staff'" or similar.

- [ ] **Step 3: Write the implementation**

```ts
// src/lib/is-staff.ts
export function isStaffEmail(email: string | null | undefined): boolean {
  if (!email) return false
  const staffEmails = (process.env.STAFF_EMAILS ?? '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
  return staffEmails.includes(email.toLowerCase())
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/lib/is-staff.test.ts`
Expected: PASS, 5/5 tests.

- [ ] **Step 5: Commit**

```bash
git add src/lib/is-staff.ts tests/lib/is-staff.test.ts
git commit -m "feat: add staff email allowlist check"
```

---

### Task 2: SonoSuite SSO token + login URL builder

**Files:**
- Create: `src/lib/sonosuite-sso.ts`
- Test: `tests/lib/sonosuite-sso.test.ts`
- Modify: `.env.example`

**Interfaces:**
- Consumes: `jose`'s `SignJWT` (already installed).
- Produces: `buildSonoSuiteLoginUrl(email: string): Promise<string>` — used
  by Task 3 (redirect route).

- [ ] **Step 1: Write the failing tests**

```ts
// tests/lib/sonosuite-sso.test.ts
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { jwtVerify } from 'jose'
import { buildSonoSuiteLoginUrl } from '@/lib/sonosuite-sso'

describe('buildSonoSuiteLoginUrl', () => {
  const originalSecret = process.env.SONOSUITE_SSO_SECRET
  const originalLoginUrl = process.env.SONOSUITE_LOGIN_URL

  beforeEach(() => {
    process.env.SONOSUITE_SSO_SECRET = 'test-secret-value'
    process.env.SONOSUITE_LOGIN_URL = 'https://sablatino.sonosuite.com/sso/login'
  })

  afterEach(() => {
    process.env.SONOSUITE_SSO_SECRET = originalSecret
    process.env.SONOSUITE_LOGIN_URL = originalLoginUrl
  })

  it('returns a URL under SONOSUITE_LOGIN_URL with a token param', async () => {
    const url = await buildSonoSuiteLoginUrl('staff@subelo.com')
    expect(url.startsWith('https://sablatino.sonosuite.com/sso/login')).toBe(true)
    const parsed = new URL(url)
    expect(parsed.searchParams.get('token')).toBeTruthy()
  })

  it('signs a token containing the email with a 60s expiry', async () => {
    const url = await buildSonoSuiteLoginUrl('staff@subelo.com')
    const token = new URL(url).searchParams.get('token')!
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode('test-secret-value')
    )
    expect(payload.email).toBe('staff@subelo.com')
    expect((payload.exp as number) - (payload.iat as number)).toBe(60)
  })

  it('throws if SONOSUITE_SSO_SECRET is missing', async () => {
    delete process.env.SONOSUITE_SSO_SECRET
    await expect(buildSonoSuiteLoginUrl('staff@subelo.com')).rejects.toThrow(
      'SONOSUITE_SSO_SECRET is not set'
    )
  })

  it('throws if SONOSUITE_LOGIN_URL is missing', async () => {
    delete process.env.SONOSUITE_LOGIN_URL
    await expect(buildSonoSuiteLoginUrl('staff@subelo.com')).rejects.toThrow(
      'SONOSUITE_LOGIN_URL is not set'
    )
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/lib/sonosuite-sso.test.ts`
Expected: FAIL with "Cannot find module '@/lib/sonosuite-sso'" or similar.

- [ ] **Step 3: Write the implementation**

```ts
// src/lib/sonosuite-sso.ts
import { SignJWT } from 'jose'

export async function buildSonoSuiteLoginUrl(email: string): Promise<string> {
  const secret = process.env.SONOSUITE_SSO_SECRET
  const loginUrl = process.env.SONOSUITE_LOGIN_URL
  if (!secret) throw new Error('SONOSUITE_SSO_SECRET is not set')
  if (!loginUrl) throw new Error('SONOSUITE_LOGIN_URL is not set')

  const token = await new SignJWT({ email })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('60s')
    .sign(new TextEncoder().encode(secret))

  const url = new URL(loginUrl)
  url.searchParams.set('token', token)
  return url.toString()
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `npx vitest run tests/lib/sonosuite-sso.test.ts`
Expected: PASS, 4/4 tests.

- [ ] **Step 5: Add the new env vars to `.env.example`**

Add these three lines to `.env.example` (alongside the existing entries):

```
STAFF_EMAILS=
SONOSUITE_SSO_SECRET=
SONOSUITE_LOGIN_URL=
```

- [ ] **Step 6: Commit**

```bash
git add src/lib/sonosuite-sso.ts tests/lib/sonosuite-sso.test.ts .env.example
git commit -m "feat: add SonoSuite SSO token signing and login URL builder"
```

---

### Task 3: SSO redirect and logout-landing route handlers

**Files:**
- Create: `src/app/admin/sonosuite-redirect/route.ts`
- Create: `src/app/admin/sonosuite-logout/route.ts`
- Test: `tests/app/admin/sonosuite-redirect.test.ts`
- Test: `tests/app/admin/sonosuite-logout.test.ts`

**Interfaces:**
- Consumes: `isStaffEmail` from `@/lib/is-staff` (Task 1),
  `buildSonoSuiteLoginUrl` from `@/lib/sonosuite-sso` (Task 2), `auth` from
  `@/auth` (existing, from subsystem #1).
- Produces: nothing consumed by later tasks — Task 4's page links to
  `/admin/sonosuite-redirect` as a plain string `href`, no import needed.

- [ ] **Step 1: Write the failing tests**

```ts
// tests/app/admin/sonosuite-redirect.test.ts
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}))

import { auth } from '@/auth'
import { GET } from '@/app/admin/sonosuite-redirect/route'

describe('GET /admin/sonosuite-redirect', () => {
  const originalSecret = process.env.SONOSUITE_SSO_SECRET
  const originalLoginUrl = process.env.SONOSUITE_LOGIN_URL
  const originalStaff = process.env.STAFF_EMAILS

  beforeEach(() => {
    process.env.SONOSUITE_SSO_SECRET = 'test-secret'
    process.env.SONOSUITE_LOGIN_URL = 'https://sablatino.sonosuite.com/sso/login'
    process.env.STAFF_EMAILS = 'staff@subelo.com'
  })

  afterEach(() => {
    process.env.SONOSUITE_SSO_SECRET = originalSecret
    process.env.SONOSUITE_LOGIN_URL = originalLoginUrl
    process.env.STAFF_EMAILS = originalStaff
    vi.mocked(auth).mockReset()
  })

  it('redirects a staff session to the SonoSuite login URL', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { email: 'staff@subelo.com' },
    } as unknown as Awaited<ReturnType<typeof auth>>)

    const response = await GET()
    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toContain(
      'https://sablatino.sonosuite.com/sso/login'
    )
  })

  it('returns 403 for a non-staff session', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { email: 'artist@example.com' },
    } as unknown as Awaited<ReturnType<typeof auth>>)

    const response = await GET()
    expect(response.status).toBe(403)
  })

  it('returns 403 when unauthenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null)
    const response = await GET()
    expect(response.status).toBe(403)
  })
})
```

```ts
// tests/app/admin/sonosuite-logout.test.ts
import { describe, expect, it } from 'vitest'
import { GET } from '@/app/admin/sonosuite-logout/route'

describe('GET /admin/sonosuite-logout', () => {
  it('redirects to /admin', async () => {
    const request = new Request('https://subelodistro.com/admin/sonosuite-logout')
    const response = await GET(request)
    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe('https://subelodistro.com/admin')
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/app/admin/`
Expected: FAIL — both route modules don't exist yet.

- [ ] **Step 3: Write the redirect route handler**

```ts
// src/app/admin/sonosuite-redirect/route.ts
import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { isStaffEmail } from '@/lib/is-staff'
import { buildSonoSuiteLoginUrl } from '@/lib/sonosuite-sso'

export async function GET() {
  const session = await auth()
  if (!isStaffEmail(session?.user?.email)) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
  }

  try {
    const url = await buildSonoSuiteLoginUrl(session!.user!.email!)
    return NextResponse.redirect(url)
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    )
  }
}
```

- [ ] **Step 4: Write the logout-landing route handler**

```ts
// src/app/admin/sonosuite-logout/route.ts
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  return NextResponse.redirect(new URL('/admin', request.url))
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `npx vitest run tests/app/admin/`
Expected: PASS, 4/4 tests across both files.

- [ ] **Step 6: Commit**

```bash
git add src/app/admin/sonosuite-redirect/route.ts src/app/admin/sonosuite-logout/route.ts tests/app/admin/sonosuite-redirect.test.ts tests/app/admin/sonosuite-logout.test.ts
git commit -m "feat: add SonoSuite SSO redirect and logout-landing routes"
```

---

### Task 4: `/admin` staff page

**Files:**
- Create: `src/app/admin/page.tsx`

**Interfaces:**
- Consumes: `isStaffEmail` from `@/lib/is-staff` (Task 1), `auth` from
  `@/auth` (existing).

- [ ] **Step 1: Write the page**

```tsx
// src/app/admin/page.tsx
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { isStaffEmail } from '@/lib/is-staff'

export default async function AdminPage() {
  const session = await auth()
  if (!session) {
    redirect('/login')
  }

  if (!isStaffEmail(session.user?.email)) {
    return (
      <main className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
        <p className="text-muted-foreground">Not authorized.</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-6">Staff</h1>
        <a
          href="/admin/sonosuite-redirect"
          className="inline-block rounded-md bg-lime px-6 py-3 text-sm font-semibold text-background"
        >
          Open SonoSuite
        </a>
      </div>
    </main>
  )
}
```

- [ ] **Step 2: Manually verify against the real dev server**

This is a Server Component gating on `redirect()` (which throws internally)
and a live session — unit-testing it in isolation adds mocking complexity
disproportionate to what it protects, so verify it the same way subsystem
#2's `page.tsx` files were verified: a real dev server plus a manually
constructed session state.

Run: `npm run dev`, then check all three states:
1. No session cookie → visiting `/admin` redirects to `/login`.
2. A valid session cookie for an email NOT in `STAFF_EMAILS` → `/admin`
   renders "Not authorized." and nothing else.
3. A valid session cookie for an email IN `STAFF_EMAILS` (set
   `STAFF_EMAILS` in `.env` to match a real test session's email first) →
   `/admin` renders the "Open SonoSuite" link, and clicking it hits
   `/admin/sonosuite-redirect` (confirm via network tab that it responds
   with a 307 to `SONOSUITE_LOGIN_URL`, even if `SONOSUITE_LOGIN_URL`
   itself is a placeholder value for this check).

- [ ] **Step 3: Run the full test suite to confirm no regressions**

Run: `npx vitest run --exclude '**/.claude/**'`
Expected: PASS, all tests from Tasks 1–3 plus every pre-existing test.

- [ ] **Step 4: Commit**

```bash
git add src/app/admin/page.tsx
git commit -m "feat: add staff-gated /admin page with SonoSuite SSO entry point"
```
