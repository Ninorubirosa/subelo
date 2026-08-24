# Artist Auth Foundation — Design

## Context: the larger SonoSuite integration

Subelo's actual distribution/royalty/payout backend will be SonoSuite (white-label
music distribution platform), connected via their documented "API workaround":
Single Sign-On (SSO/JWT) + the Bulk Upload (CSV) tool, since SonoSuite doesn't
expose a general-purpose public API on our plan.

The full integration decomposes into four sequenced subsystems:

1. **Artist auth foundation** (this doc) — Subelo's own signup/login. Zero
   dependency on SonoSuite.
2. **Catalog/upload sync** — artist submits a release in Subelo's UI; we
   generate SonoSuite's Bulk Upload CSV + public asset links and ingest it
   into the one shared SonoSuite distributor account.
3. **Royalty/streams reporting sync** — pull sales/royalty data back from
   SonoSuite (exact export mechanism TBD — not publicly documented, needs a
   doc pull from the SonoSuite support portal) and attribute it to the right
   artist in Subelo's own DB via ISRC/UPC/release matching.
4. **Staff SSO bridge + payouts** — internal-only SonoSuite SSO for Subelo
   staff (artists never see SonoSuite directly), plus payout/account
   management, which likely needs a direct conversation with SonoSuite
   support before any design — the riskiest, least-documented piece.

Key product decisions already made:
- One Subelo account = one artist for v1. Label accounts (one login managing
  multiple artists) are deferred but the data model below is shaped so that
  relation can be loosened later without a rewrite.
- Artists never authenticate into SonoSuite directly — only Subelo staff do,
  later, as an internal tool. This removes any need to provision per-artist
  SonoSuite accounts as part of this subsystem.

This document specs subsystem #1 only.

## Goal

Ship Subelo's own artist signup/login, independent of SonoSuite, as the
foundation every other artist-facing feature (upload, dashboard) builds on.

## Architecture

Auth.js (the `next-auth` package already listed as a dependency but currently
unconfigured) wired into the Next.js App Router, using its Prisma adapter
against the existing SQLite DB (`DATABASE_URL`), with a single Email
(magic-link) provider whose delivery goes through Resend. No passwords are
ever stored — eliminates hashing, breach-reuse risk, and reset-flow code
entirely. Sessions are JWT-based (stateless, no DB read per request).

Signup and signin are the same flow: enter email → click the emailed link →
session starts. If this is a brand-new user, their `Artist` profile is
created automatically in the same step, via Auth.js's `createUser` event
hook — so "every `User` has exactly one `Artist`" is an invariant that's true
from the moment auth exists, and every feature built after this can rely on
`session.user.artistId` without a null check.

Google OAuth is a natural fast-follow (Auth.js's Prisma adapter already
models multi-provider accounts per user with zero schema changes) but is not
part of this pass.

## Data model changes

Requires a Prisma migration:

- Extend `User`: add `emailVerified DateTime?` (Auth.js requires this field
  to exist on the adapter's user model).
- Add Auth.js's standard adapter models: `Account`, `Session`,
  `VerificationToken` — the boilerplate shape the Prisma adapter expects.
- Add `Artist.userId String @unique` + a relation to `User`. This is the
  piece that's currently entirely missing — `Artist` and `User` aren't
  linked at all in the schema today. Keeping it `@unique` (not a join table)
  is what makes it 1:1 for v1; the label model later replaces this with a
  join table without touching anything else that depends on
  `session.user.artistId`.

## Components / files touched

- `src/auth.ts` — Auth.js config: `PrismaAdapter`, Email provider, a
  `session` callback that embeds `artistId` into the session token so
  server components/route handlers get it without an extra query.
- `src/lib/resend.ts` — thin Resend client wrapper.
- Magic-link email template (plain, on-brand — reuses the existing brand
  blue, not a generic Auth.js default template).
- `src/app/login/page.tsx` — email input form + "check your inbox" state.
- `src/app/api/auth/error/page.tsx` (or equivalent) — a real, friendly error
  page for expired/invalid links, replacing Auth.js's bare default.
- Auth.js's `events.createUser` hook — creates the linked `Artist` row.

## Data flow

1. Visitor enters email on `/login`.
2. Auth.js's Email provider generates a verification token, stores it in
   `VerificationToken`, and calls our custom send function, which calls
   Resend.
3. User clicks the link. Auth.js verifies the token, upserts the `User` row
   (`emailVerified` set). On the very first signin for that user, the
   `createUser` event fires and we create the linked `Artist` row in the
   same transaction.
4. A JWT session cookie is issued. Subsequent requests read
   `session.user.artistId` directly from the decoded token — no DB round
   trip needed for the common case.

## Error handling

- Expired or already-used magic link → the custom error page, with a
  one-click "send me a new link" action, not a dead end.
- If the Resend API call itself fails, the `/login` form surfaces an error
  state — never show "check your email" if sending actually failed.
- Signin-request rate limiting is not included in Auth.js by default and is
  not part of this pass (email-bombing risk exists without it) — flagged as
  a fast-follow, not a v1 blocker, since it doesn't block anything
  downstream.

## Testing

Two checks, matching the two invariants actually worth protecting for a
magic-link auth system — not a full e2e browser suite, which would be
overkill for this pass:

1. Integration-style test on the signin route with a mocked Resend client:
   asserts a `VerificationToken` row is created and the mock send function
   receives the correct link.
2. Test on the `createUser` event hook: asserts exactly one `Artist` row is
   created per new `User`, and that a second signin for an existing user
   does not create a duplicate.

## Out of scope for this doc

- Google OAuth (fast-follow, same schema).
- Signin rate limiting (fast-follow).
- Label/multi-artist accounts (deferred; schema shaped to allow it later).
- Everything in subsystems #2–#4 (catalog sync, royalty sync, staff SSO
  bridge, payouts) — each gets its own spec once reached, and #3/#4 need a
  doc pull from SonoSuite's support portal (or a direct conversation with
  their support/account team) before they can be designed concretely, since
  the exact CSV schema, JWT payload shape, and reporting export format are
  not publicly documented.
