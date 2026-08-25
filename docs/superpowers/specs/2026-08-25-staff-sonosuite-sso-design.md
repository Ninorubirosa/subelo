# Staff SonoSuite SSO Bridge — Design

## Context: subsystem #4 of the SonoSuite integration, re-scoped

Per the SonoSuite integration decomposition (see
`2026-08-24-artist-auth-foundation-design.md`), subsystem #4 was originally
"internal-only SonoSuite SSO for Subelo staff, plus payout/account
management" — flagged at the time as "the riskiest, least-documented piece,"
needing a doc pull from SonoSuite's support portal before it could be
designed concretely.

Two scoping decisions narrow this significantly:

1. **Payouts are read-only, viewed inside SonoSuite itself.** Staff land in
   SonoSuite's real backend via SSO and see payout/earnings data in
   SonoSuite's own UI — nothing is mirrored into Subelo's database, no new
   dashboard is built. This sidesteps the undocumented data-export problem
   entirely; that problem still belongs to subsystem #3 (royalty/streams
   reporting sync), untouched by this doc.
2. **Staff authenticate via the existing artist login, gated by an email
   allowlist.** No new auth system, no `role` field, no admin-managed
   permissions UI — subsystem #1's magic-link flow already exists and
   already produces a `session.user.email`; this subsystem only adds a
   check against a fixed list of staff emails.

With both of those decisions, subsystem #4 reduces to exactly one thing: a
bridge that lets an already-authenticated-as-staff Subelo session redirect
into SonoSuite's backend without re-entering SonoSuite credentials.

**Open technical unknown, carried into this doc rather than hidden:** the
live SonoSuite backend's SSO settings (Setup → 3rd Party → SSO) expose
exactly three fields — `Secret`, `Login Url to redirect`, `Logout Url to
redirect` — currently inactive. That confirms the shape of a standard
delegated-SSO integration (SonoSuite redirects unauthenticated users to
Subelo's `Login Url`; Subelo redirects back with a signed token; SonoSuite
verifies it with the shared `Secret`). It does **not** confirm the exact
token format — claim names, signing algorithm, whether the token travels as
a query param or POST body. That live SonoSuite session expired mid-session
and couldn't be re-checked for a documentation link. This doc designs
around the standard version of this pattern (HMAC-signed JWT, GET redirect
with the token as a query param, short expiry) and scopes confirming the
exact spec as the first implementation task, before the real signer is
written — not deferred indefinitely.

## Goal

Let an allowlisted Subelo staff member click one link in a minimal internal
admin page and land inside the real SonoSuite backend, already
authenticated — replacing "log into SonoSuite with its own password" with
"you're already signed into Subelo, one click takes you there."

## Product decisions already made

- **No payout dashboard in Subelo.** Staff see payouts, catalog status, and
  everything else directly in SonoSuite's own UI after the SSO handoff.
- **No new staff-permissions model.** A single email allowlist
  (`STAFF_EMAILS`, comma-separated env var) gates access. All-or-nothing —
  no permission tiers. Matches the product's actual current size (one
  operator).
- **Reuse subsystem #1's auth entirely.** Staff sign in the exact same way
  artists do (magic-link email). The only new check is "is this session's
  email in the allowlist," layered on top.
- **Artists never see any of this.** `/admin` is unreachable/unlinked from
  any artist-facing page; an authenticated artist hitting it directly gets
  the same "not authorized" response as an unauthenticated visitor would
  after login.

## Architecture

A new `/admin` route tree, server-side gated on every request (Server
Component + a shared helper, not a client-side check) by
`session.user.email` against `STAFF_EMAILS`. One page: a single "Open
SonoSuite" link. That link points at a Route Handler that re-verifies the
allowlist (defense in depth — the page-level gate and the redirect
endpoint's gate are independent checks, so a leaked/bookmarked direct link
to the redirect endpoint is still safe), builds a short-lived signed JWT
using `jose` (Auth.js v5 already depends on it for its own JWT handling —
no new package needed), and issues an HTTP redirect to SonoSuite's login
endpoint with the token attached.

A second, fixed Route Handler exists purely to be registered as SonoSuite's
`Logout Url to redirect` — when a staff member logs out of the SonoSuite
backend, SonoSuite sends their browser here, and it just redirects back to
`/admin`.

## Data model changes

None. `STAFF_EMAILS` is an env var (like `AUTH_SECRET`,
`AUTH_RESEND_KEY`), not a database table — no Prisma migration, matching
the product's current single-operator scale. If Subelo ever has multiple
staff with different permissions, that's a real schema addition to design
then, not now.

## Components / files touched

- `src/lib/is-staff.ts` — `isStaffEmail(email: string | null | undefined):
  boolean`, checking against `process.env.STAFF_EMAILS.split(',')`. One
  function, reused by both the page gate and the redirect endpoint's gate.
- `src/app/admin/page.tsx` — Server Component. Redirects to `/login` if no
  session; renders a plain "not authorized" message (not a redirect, so the
  URL bar stays honest about what was denied) if the session's email isn't
  staff; otherwise renders the "Open SonoSuite" link.
- `src/lib/sonosuite-sso.ts` — `buildSonoSuiteLoginUrl(email: string):
  string`. Signs a short-lived JWT (claims and algorithm to be confirmed
  against SonoSuite's actual SSO spec — see Task 1 below; designed here
  with a `{ email, iat, exp }` payload, `HS256`, 60-second expiry, signed
  with `SONOSUITE_SSO_SECRET`) and appends it to
  `SONOSUITE_LOGIN_URL` (both new env vars) as a query parameter, matching
  the delegated-SSO pattern SonoSuite's settings page implies.
- `src/app/admin/sonosuite-redirect/route.ts` — Route Handler. Re-checks
  `isStaffEmail`, calls `buildSonoSuiteLoginUrl`, issues a 302 redirect.
  GET, not POST — this is a same-origin navigation from a link the staff
  member already had to be authenticated-and-allowlisted to see, not a
  state-changing action, so no CSRF token is needed.
- `src/app/admin/sonosuite-logout/route.ts` — Route Handler registered as
  SonoSuite's `Logout Url to redirect`. Redirects to `/admin`. No auth
  check needed — it does nothing but redirect.
- `.env.example` — add `STAFF_EMAILS=`, `SONOSUITE_SSO_SECRET=`,
  `SONOSUITE_LOGIN_URL=` alongside the existing entries.

## Data flow

1. Staff member (already signed into Subelo per subsystem #1, or signs in
   fresh via the same `/login` flow) visits `/admin`.
2. `isStaffEmail(session.user.email)` gates the page: not signed in →
   `/login`; signed in but not staff → plain "not authorized" message,
   nothing else rendered; staff → the "Open SonoSuite" link renders.
3. Clicking the link hits `/admin/sonosuite-redirect`, which re-checks
   `isStaffEmail` (independent of the page-level check), builds the signed
   JWT, and 302s to `${SONOSUITE_LOGIN_URL}?token=<jwt>`.
4. SonoSuite verifies the token's signature against the shared
   `SONOSUITE_SSO_SECRET` and the staff member is logged into the real
   SonoSuite backend — payouts, catalog, everything, in SonoSuite's own UI.
5. When the staff member eventually logs out of SonoSuite, SonoSuite
   redirects their browser to `/admin/sonosuite-logout`, which sends them
   back to `/admin`.

## Error handling

- Not signed in → standard redirect to `/login`, identical to every other
  authenticated route in the app.
- Signed in, not staff → a plain-language "not authorized" message, no
  stack trace, no hint about what the allowlist contains.
- `STAFF_EMAILS`, `SONOSUITE_SSO_SECRET`, or `SONOSUITE_LOGIN_URL` missing
  from env at request time → the redirect endpoint returns a clear 500
  with a message naming which env var is missing (this is an
  internal-only tool; a descriptive error here is a debugging aid, not an
  information-disclosure risk the way it would be on a public-facing page).
- Token expiry is intentionally short (60 seconds) to limit the window a
  captured/logged URL could be replayed in — this is a judgment call made
  in this doc pending the real spec; if SonoSuite's actual protocol
  specifies a different expected expiry, that becomes the real value at
  implementation time.

## Testing

Two invariants, matching the pattern from subsystems #1 and #2 (real
behavior, not mocks; not a full e2e suite):

1. A test on `isStaffEmail`: an email present in `STAFF_EMAILS` (including
   case-insensitivity — email comparison should not be case-sensitive)
   returns `true`; an email absent, or a `null`/`undefined` session email,
   returns `false`.
2. A test on `buildSonoSuiteLoginUrl`: the returned URL starts with
   `SONOSUITE_LOGIN_URL`, has a `token` query param, and that token
   decodes (using the same secret) to a payload containing the expected
   email and an `exp` roughly 60 seconds after `iat`. This protects the
   piece of this subsystem that's actually risky to get wrong, independent
   of whether SonoSuite's live backend accepts it — that acceptance can
   only be confirmed against the real service, not unit-tested.

## Out of scope for this doc

- **Confirming the exact JWT claim names/algorithm/token-transport against
  SonoSuite's real SSO documentation or support team.** This doc designs
  around the standard version of the pattern; the first implementation
  task is verifying (or correcting) that against SonoSuite directly, before
  the real signer ships. If the real spec differs, only
  `sonosuite-sso.ts`'s internals change — the rest of this design
  (allowlist gate, route shape, data flow) is unaffected either way.
- **Any payout dashboard or data mirrored into Subelo.** Explicitly
  decided against above — subsystem #3's territory if it ever happens.
- **Multiple staff permission tiers.** Single allowlist, all-or-nothing.
- **Subsystem #3 (royalty/streams reporting sync).** Separate, unstarted,
  still blocked on the same undocumented-export-mechanism problem this doc
  deliberately avoids.
