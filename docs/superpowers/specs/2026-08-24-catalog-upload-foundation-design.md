# Catalog Upload Foundation — Design

## Context: subsystem #2 of the SonoSuite integration, re-scoped

Per the SonoSuite integration decomposition (see
`2026-08-24-artist-auth-foundation-design.md` for subsystems #1, #3, #4),
subsystem #2 was originally "catalog/upload sync — generate SonoSuite's
Bulk Upload CSV + public asset links and ingest it into the shared
SonoSuite distributor account."

Direct inspection of the live SonoSuite backend
(`sablatino.sonosuite.com`, the real, already-operational "Subelo Distro"
account — 6 real releases already delivered) changed two things:

1. **Bulk Upload is not actually enabled on this SonoSuite account.**
   Setup → Options → Bulk Upload shows both `Assigned` and `Enabled`
   unchecked. The account's plan `Level` is `Mid`; the original support
   article said Bulk Upload requires Gold or Platinum. This blocks the
   "push to SonoSuite" half of subsystem #2 until the plan is upgraded or
   the feature is assigned — an external, non-code dependency.
2. **The real release-creation schema is now known directly**, not
   inferred from docs. SonoSuite's own "New Release" wizard (Details →
   Tracks → Distribution → Review) requires: release title, title
   language, version-of flag, cover art (JPEG/TIFF/PNG, square,
   3000–5000px, RGB 24-bit, ≤36MB), label, copyright (©) holder,
   phonographic (℗) holder, previously-distributed flag.

Given the block on 2b, this spec covers only **subsystem 2a: Subelo's own
internal catalog data model and artist-facing upload flow** — real,
shippable work with no SonoSuite dependency. Subsystem 2b (CSV
generation + SonoSuite ingestion) is stubbed at the data-model level so
it's a small addition later, not a rework, once Bulk Upload access is
confirmed.

Also confirmed directly in the live SonoSuite UI (Setup → 3rd Party →
SSO): the SSO mechanism is exactly `Secret` + `Login Url to redirect` +
`Logout Url to redirect`, currently inactive — relevant to subsystem #4,
not this spec, but recorded here since it was learned in the same
session.

## Goal

Let an authenticated artist (subsystem #1) create a release with one or
more tracks and collaborator splits, uploading real audio/cover-art
files, saved progressively as a draft they can resume — entirely within
Subelo's own product, with no SonoSuite dependency. The data model is
shaped so that generating SonoSuite's Bulk Upload CSV later is a read of
data that already exists, not new modeling work.

## Product decisions already made

- **Draft-first, progressive save.** The `Release` row is created (status
  `draft`) as soon as the artist starts the flow; each step's data saves
  as they go, so leaving and resuming works. Matches how SonoSuite's own
  wizard behaves.
- **Splits are release-level, not track-level.** The shipped marketing
  copy (`FAQ.tsx`) already promises "unlimited collaborators **per
  release**" — the data model matches that exactly.
- **File storage is Vercel Blob.** No new external account (Subelo
  already deploys on Vercel), native Next.js integration, and it
  produces public URLs directly — the same shape SonoSuite's Bulk Upload
  CSV will need for asset links later.

## Architecture

New Prisma models (`Track`, `Participant`) plus new fields on the
existing `Release` model, matching SonoSuite's real required fields where
they overlap. An artist-facing upload wizard at `/upload` (auth-gated via
subsystem #1's session), structured Details → Tracks → Review, mirroring
SonoSuite's own wizard shape. Cover art and audio files upload directly
from the client to Vercel Blob; the resulting public URL is what's
persisted — never a local file path — so the eventual CSV-generation step
(2b) is a straight read of already-public URLs.

## Data model changes

Requires a Prisma migration:

- Extend `Release`:
  - `titleLanguage String?`
  - `isVersion Boolean @default(false)`
  - `versionType String?` (e.g. "Remastered", "Live", "Remix" — free text,
    only meaningful when `isVersion` is true)
  - `copyrightHolder String?`
  - `phonographicHolder String?`
  - `previouslyDistributed Boolean @default(false)`
  - `sonosuiteStatus String @default("not_exported")` — stub for
    subsystem 2b; values `not_exported` / `exported` for now, no CSV
    generation logic yet.
  - `status`: already exists (`String @default("live")`); real artist
    releases created through this flow start at `"draft"`, not `"live"`
    — the existing default stays as-is for the marketing dashboard's demo
    seed data, this flow passes `status: "draft"` explicitly at creation.
- Add `Track` (new model):
  - `id`, `releaseId` (FK to `Release`), `title String`,
    `trackNumber Int`, `isrc String?`, `audioFileUrl String?`,
    `durationSeconds Int?`, `explicit Boolean @default(false)`,
    `createdAt`, `updatedAt`.
- Add `Participant` (new model):
  - `id`, `releaseId` (FK to `Release`), `name String`,
    `email String?`, `role String` (e.g. "artist", "producer",
    "featured"), `splitPercent Float`, `createdAt`.

## Components

- `src/app/upload/page.tsx` — wizard shell (step state, progress
  indicator matching the 3 steps).
- `src/app/upload/steps/details.tsx` — release title, title language,
  version-of flag, cover art upload, label, copyright/phonographic
  holders, previously-distributed flag. Field set and cover-art
  constraints (JPEG/TIFF/PNG, square, 3000–5000px, RGB 24-bit, ≤36MB)
  copied from the real SonoSuite wizard so files pass validation the
  first time they're actually pushed in 2b.
- `src/app/upload/steps/tracks.tsx` — add/reorder tracks, per-track title
  + audio file upload + ISRC (optional) + explicit flag.
- `src/app/upload/steps/participants.tsx` — collaborator list with
  name/email/role/split-percent, release-level (not per-track).
- `src/app/upload/steps/review.tsx` — summary of everything above,
  final "Submit" action that flips `Release.status` from `draft` to
  `submitted`.
- `src/lib/blob-upload.ts` — thin wrapper around `@vercel/blob`'s client
  upload, used by both the cover-art and audio-file inputs.
- Server actions (not a REST API — this is all first-party, same-origin
  UI) for creating the draft `Release` on step 1 entry, upserting
  `Track`/`Participant` rows as the artist edits them, and the final
  submit transition.

## Data flow

1. Artist navigates to `/upload` (redirects to `/login` if unauthenticated,
   via subsystem #1's session).
2. On first render, if no in-progress draft exists for this artist, a
   `Release` row is created immediately with `status: "draft"`,
   `artistId: session.user.artistId`.
3. Each step's form fields save via a server action as the artist fills
   them in (debounced or on-blur, not only on "Next") — leaving mid-flow
   and returning later resumes from the DB, not local state.
4. Cover art / audio file inputs upload directly to Vercel Blob from the
   client; the returned public URL is what the server action persists
   onto `Release.coverArtUrl` / `Track.audioFileUrl`.
5. On final Review step submit, `Release.status` flips to `"submitted"`.
   Nothing is sent to SonoSuite yet — `sonosuiteStatus` stays
   `"not_exported"` until subsystem 2b exists.

## Error handling

- File upload failures (size/format rejected by Vercel Blob, or the
  cover-art dimension/format constraints copied from SonoSuite) surface
  inline on the specific field, not as a page-level error — the artist
  shouldn't lose other already-entered data over one bad file.
- Leaving the flow mid-upload and returning: the draft `Release` and any
  already-saved `Track`/`Participant` rows are there; incomplete/missing
  required fields are simply blank, re-validated on the next submit
  attempt — no separate "resume" mechanism needed since the DB is always
  the source of truth.
- Split percentages: validate they sum to ≤100% before allowing Review
  step submission (not a hard DB constraint — a submission-time check,
  since a draft can legitimately be incomplete while editing).

## Testing

Two invariants worth protecting, matching the pattern from subsystem #1
(real behavior, not mocks; not a full e2e suite):

1. A test that creating a draft `Release` for an artist who already has
   an in-progress draft returns the *existing* draft, not a second one
   (mirrors `createArtistForUser`'s idempotency pattern — one
   in-progress draft per artist at a time, for v1).
2. A test on the split-percent validation: sums >100% are rejected at
   submission time; sums ≤100% (including a single 100% "solo artist"
   default) pass.

## Out of scope for this doc

- Subsystem 2b: SonoSuite Bulk Upload CSV generation and ingestion —
  blocked on SonoSuite plan/feature access, picked up once confirmed
  enabled. The data model above (public Blob URLs, release-level
  participants matching what SonoSuite's UI itself calls "roles") is
  deliberately shaped so this is additive, not a rework.
- Multiple drafts per artist / draft history — v1 assumes one
  in-progress draft at a time, matching the product's current
  single-release-at-a-time upload flow.
- Editing a release after `status: "submitted"` — out of scope; this doc
  covers the creation flow only.
- Label/multi-artist accounts — still deferred per subsystem #1's spec.
