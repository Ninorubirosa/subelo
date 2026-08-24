# Catalog Upload Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let an authenticated artist create a release with tracks and collaborator splits, uploading real audio/cover-art files to Vercel Blob, saved progressively as a resumable draft — entirely within Subelo's own product, no SonoSuite dependency.

**Architecture:** New Prisma models (`Track`, `Participant`) plus new fields on `Release`. A client-side upload wizard at `/upload` (Details → Tracks → Participants → Review), backed by Server Actions and an auth-gated Vercel Blob client-upload route. Files upload directly from the browser to Blob storage; only the resulting public URL is ever persisted.

**Tech Stack:** Next.js 16 App Router (Server Components + Server Actions), Prisma + SQLite, `@vercel/blob` for file storage, Vitest (already set up).

**Spec:** `docs/superpowers/specs/2026-08-24-catalog-upload-foundation-design.md`

## Global Constraints

- Splits are release-level, not track-level (matches shipped copy in `FAQ.tsx`: "unlimited collaborators per release").
- Draft-first: the `Release` row exists (status `draft`) from the moment the artist starts the flow; every step saves via a Server Action as they go, not only on final submit.
- One in-progress draft per artist at a time for v1 (no multi-draft support).
- File uploads go straight from the browser to Vercel Blob — never through a Next.js Server Action body (avoids the 4.5MB request body limit for audio files).
- SonoSuite export (subsystem 2b) is out of scope — `Release.sonosuiteStatus` is a stub field only.
- `next-auth`/`@/auth` (from the artist-auth-foundation plan) is the auth source; every Server Action and the Blob upload route must verify the session before mutating or issuing an upload token.

---

### Task 1: Vercel Blob dependency, upload route, and client wrapper

**Files:**
- Modify: `package.json` (add `@vercel/blob`)
- Create: `src/app/api/blob/upload/route.ts`
- Create: `src/lib/blob-upload.ts`
- Test: `tests/lib/blob-upload.test.ts`

**Interfaces:**
- Produces: `uploadCoverArt(file: File): Promise<string>` and `uploadAudioFile(file: File): Promise<string>` from `src/lib/blob-upload.ts` — later tasks' client components call these exact functions with these exact signatures.

- [ ] **Step 1: Install the dependency**

```bash
npm install @vercel/blob@2.8.0
```

- [ ] **Step 2: Write the auth-gated upload route**

Create `src/app/api/blob/upload/route.ts`:

```typescript
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client'
import { NextResponse } from 'next/server'
import { auth } from '@/auth'

const COVER_ART_TYPES = ['image/jpeg', 'image/png', 'image/tiff']
const AUDIO_TYPES = [
  'audio/wav',
  'audio/x-wav',
  'audio/flac',
  'audio/x-flac',
  'audio/aiff',
  'audio/x-aiff',
]

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        const session = await auth()
        if (!session?.user?.artistId) {
          throw new Error('Not authenticated')
        }

        const payload = clientPayload ? JSON.parse(clientPayload) : {}
        const allowedContentTypes =
          payload.kind === 'audio' ? AUDIO_TYPES : COVER_ART_TYPES

        return {
          allowedContentTypes,
          addRandomSuffix: true,
        }
      },
    })

    return NextResponse.json(jsonResponse)
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    )
  }
}
```

- [ ] **Step 3: Write the client-side upload wrapper**

Create `src/lib/blob-upload.ts`:

```typescript
import { upload } from '@vercel/blob/client'

export async function uploadCoverArt(file: File): Promise<string> {
  const blob = await upload(file.name, file, {
    access: 'public',
    handleUploadUrl: '/api/blob/upload',
    clientPayload: JSON.stringify({ kind: 'cover-art' }),
  })
  return blob.url
}

export async function uploadAudioFile(file: File): Promise<string> {
  const blob = await upload(file.name, file, {
    access: 'public',
    handleUploadUrl: '/api/blob/upload',
    clientPayload: JSON.stringify({ kind: 'audio' }),
  })
  return blob.url
}
```

- [ ] **Step 4: Write the failing test**

Create `tests/lib/blob-upload.test.ts`:

```typescript
import { afterEach, describe, expect, it, vi } from 'vitest'

vi.mock('@vercel/blob/client', () => ({
  upload: vi.fn(),
}))

import { upload } from '@vercel/blob/client'
import { uploadAudioFile, uploadCoverArt } from '@/lib/blob-upload'

describe('blob-upload', () => {
  afterEach(() => {
    vi.mocked(upload).mockReset()
  })

  it('uploadCoverArt calls upload with the cover-art payload and returns the url', async () => {
    vi.mocked(upload).mockResolvedValue({
      url: 'https://blob.vercel-storage.com/cover.jpg',
    } as Awaited<ReturnType<typeof upload>>)

    const file = new File(['data'], 'cover.jpg', { type: 'image/jpeg' })
    const url = await uploadCoverArt(file)

    expect(url).toBe('https://blob.vercel-storage.com/cover.jpg')
    expect(upload).toHaveBeenCalledWith(
      'cover.jpg',
      file,
      expect.objectContaining({
        access: 'public',
        handleUploadUrl: '/api/blob/upload',
        clientPayload: JSON.stringify({ kind: 'cover-art' }),
      })
    )
  })

  it('uploadAudioFile calls upload with the audio payload and returns the url', async () => {
    vi.mocked(upload).mockResolvedValue({
      url: 'https://blob.vercel-storage.com/track.wav',
    } as Awaited<ReturnType<typeof upload>>)

    const file = new File(['data'], 'track.wav', { type: 'audio/wav' })
    const url = await uploadAudioFile(file)

    expect(url).toBe('https://blob.vercel-storage.com/track.wav')
    expect(upload).toHaveBeenCalledWith(
      'track.wav',
      file,
      expect.objectContaining({
        clientPayload: JSON.stringify({ kind: 'audio' }),
      })
    )
  })
})
```

- [ ] **Step 5: Run the test to verify it fails**

Run: `npm test -- tests/lib/blob-upload.test.ts`
Expected: FAIL — `Cannot find module '@/lib/blob-upload'`.

- [ ] **Step 6: Run the test to verify it passes**

Run: `npm test -- tests/lib/blob-upload.test.ts`
Expected: 2 tests PASS.

- [ ] **Step 7: Commit**

```bash
git add package.json package-lock.json src/app/api/blob/upload/route.ts src/lib/blob-upload.ts tests/lib/blob-upload.test.ts
git commit -m "feat: add Vercel Blob upload route and client wrapper"
```

---

### Task 2: Extend the Prisma schema for Track, Participant, and Release fields

**Files:**
- Modify: `prisma/schema.prisma`

**Interfaces:**
- Produces: `Track.releaseId`, `Participant.releaseId`, `Release.status`/`titleLanguage`/`isVersion`/`versionType`/`copyrightHolder`/`phonographicHolder`/`previouslyDistributed`/`sonosuiteStatus` — every later task's Prisma calls use these exact field names.

- [ ] **Step 1: Extend the `Release` model**

In `prisma/schema.prisma`, find the `Release` model (already extended by the artist-auth-foundation branch with nothing conflicting here) and add the following fields inside it, alongside the existing ones:

```prisma
  titleLanguage         String?
  isVersion             Boolean  @default(false)
  versionType           String?
  copyrightHolder       String?
  phonographicHolder    String?
  previouslyDistributed Boolean  @default(false)
  sonosuiteStatus       String   @default("not_exported")
  tracks                Track[]
  participants          Participant[]
```

Do not change the existing `status String @default("live")` field — that default stays for the marketing dashboard's seed data; this feature's code passes `status: "draft"` explicitly at creation (Task 3).

- [ ] **Step 2: Add the `Track` model**

Add to `prisma/schema.prisma`:

```prisma
model Track {
  id              String   @id @default(cuid())
  releaseId       String
  release         Release  @relation(fields: [releaseId], references: [id], onDelete: Cascade)
  title           String
  trackNumber     Int
  isrc            String?
  audioFileUrl    String?
  durationSeconds Int?
  explicit        Boolean  @default(false)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

- [ ] **Step 3: Add the `Participant` model**

Add to `prisma/schema.prisma`:

```prisma
model Participant {
  id           String   @id @default(cuid())
  releaseId    String
  release      Release  @relation(fields: [releaseId], references: [id], onDelete: Cascade)
  name         String
  email        String?
  role         String
  splitPercent Float
  createdAt    DateTime @default(now())
}
```

- [ ] **Step 4: Validate the schema**

Run: `npx prisma validate`
Expected: `The schema at prisma/schema.prisma is valid 🚀`

- [ ] **Step 5: Run the migration**

```bash
npx prisma migrate dev --name add_track_participant_release_fields
```

- [ ] **Step 6: Regenerate the Prisma client**

Run: `npx prisma generate`
Expected: completes with no errors — `Track` and `Participant` are now valid Prisma models, `Release` includes the new fields and relations.

- [ ] **Step 7: Commit**

```bash
git add prisma/schema.prisma prisma/migrations
git commit -m "feat: add Track and Participant models, extend Release for uploads"
```

---

### Task 3: `getOrCreateDraftRelease` — one in-progress draft per artist

**Files:**
- Create: `src/lib/get-or-create-draft-release.ts`
- Test: `tests/lib/get-or-create-draft-release.test.ts`

**Interfaces:**
- Consumes: `PrismaClient` (from `@prisma/client`)
- Produces: `getOrCreateDraftRelease(prisma: PrismaClient, artistId: string): Promise<Release>` — the `/upload` page (Task 6) calls this exact function with this exact signature on every load.

- [ ] **Step 1: Write the failing test**

Create `tests/lib/get-or-create-draft-release.test.ts`:

```typescript
import { PrismaClient } from '@prisma/client'
import path from 'node:path'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { getOrCreateDraftRelease } from '@/lib/get-or-create-draft-release'

const testDbPath = path.join(process.cwd(), 'prisma', 'test.db')
const prisma = new PrismaClient({ datasourceUrl: `file:${testDbPath}` })

let artistId: string

beforeAll(async () => {
  await prisma.user.deleteMany({
    where: { email: 'draft-release-test@example.com' },
  })

  const user = await prisma.user.create({
    data: { email: 'draft-release-test@example.com' },
  })
  const artist = await prisma.artist.create({
    data: { userId: user.id, name: 'Draft Test Artist' },
  })
  artistId = artist.id
})

afterAll(async () => {
  await prisma.release.deleteMany({ where: { artistId } })
  await prisma.artist.delete({ where: { id: artistId } })
  await prisma.user.deleteMany({
    where: { email: 'draft-release-test@example.com' },
  })
  await prisma.$disconnect()
})

describe('getOrCreateDraftRelease', () => {
  it('creates a draft release for an artist with none', async () => {
    const release = await getOrCreateDraftRelease(prisma, artistId)
    expect(release.artistId).toBe(artistId)
    expect(release.status).toBe('draft')
  })

  it('returns the same draft on a second call, not a new one', async () => {
    const first = await getOrCreateDraftRelease(prisma, artistId)
    const second = await getOrCreateDraftRelease(prisma, artistId)
    expect(second.id).toBe(first.id)

    const count = await prisma.release.count({
      where: { artistId, status: 'draft' },
    })
    expect(count).toBe(1)
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- tests/lib/get-or-create-draft-release.test.ts`
Expected: FAIL — `Cannot find module '@/lib/get-or-create-draft-release'`.

- [ ] **Step 3: Write the implementation**

Create `src/lib/get-or-create-draft-release.ts`:

```typescript
import type { PrismaClient, Release } from '@prisma/client'

export async function getOrCreateDraftRelease(
  prisma: PrismaClient,
  artistId: string
): Promise<Release> {
  const existingDraft = await prisma.release.findFirst({
    where: { artistId, status: 'draft' },
    orderBy: { createdAt: 'desc' },
  })

  if (existingDraft) {
    return existingDraft
  }

  return prisma.release.create({
    data: {
      artistId,
      title: '',
      status: 'draft',
    },
  })
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- tests/lib/get-or-create-draft-release.test.ts`
Expected: 2 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/get-or-create-draft-release.ts tests/lib/get-or-create-draft-release.test.ts
git commit -m "feat: add idempotent getOrCreateDraftRelease"
```

---

### Task 4: `validateSplitPercentages`

**Files:**
- Create: `src/lib/validate-split-percentages.ts`
- Test: `tests/lib/validate-split-percentages.test.ts`

**Interfaces:**
- Produces: `validateSplitPercentages(participants: { splitPercent: number }[]): { valid: boolean; total: number }` — the Participants step's Server Action (Task 8) and Review step's submit action (Task 9) both call this exact function.

- [ ] **Step 1: Write the failing test**

Create `tests/lib/validate-split-percentages.test.ts`:

```typescript
import { describe, expect, it } from 'vitest'
import { validateSplitPercentages } from '@/lib/validate-split-percentages'

describe('validateSplitPercentages', () => {
  it('accepts a single solo artist at 100%', () => {
    const result = validateSplitPercentages([{ splitPercent: 100 }])
    expect(result.valid).toBe(true)
    expect(result.total).toBe(100)
  })

  it('accepts multiple collaborators summing to exactly 100%', () => {
    const result = validateSplitPercentages([
      { splitPercent: 60 },
      { splitPercent: 25 },
      { splitPercent: 15 },
    ])
    expect(result.valid).toBe(true)
    expect(result.total).toBe(100)
  })

  it('rejects splits summing to more than 100%', () => {
    const result = validateSplitPercentages([
      { splitPercent: 70 },
      { splitPercent: 40 },
    ])
    expect(result.valid).toBe(false)
    expect(result.total).toBe(110)
  })

  it('accepts an empty list (no collaborators added yet, mid-draft)', () => {
    const result = validateSplitPercentages([])
    expect(result.valid).toBe(true)
    expect(result.total).toBe(0)
  })
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm test -- tests/lib/validate-split-percentages.test.ts`
Expected: FAIL — `Cannot find module '@/lib/validate-split-percentages'`.

- [ ] **Step 3: Write the implementation**

Create `src/lib/validate-split-percentages.ts`:

```typescript
export function validateSplitPercentages(
  participants: { splitPercent: number }[]
): { valid: boolean; total: number } {
  const total = participants.reduce((sum, p) => sum + p.splitPercent, 0)
  return { valid: total <= 100, total }
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `npm test -- tests/lib/validate-split-percentages.test.ts`
Expected: 4 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/validate-split-percentages.ts tests/lib/validate-split-percentages.test.ts
git commit -m "feat: add validateSplitPercentages"
```

---

### Task 5: Server Actions for the upload wizard

**Files:**
- Create: `src/app/upload/actions.ts`

**Interfaces:**
- Consumes: `validateSplitPercentages` (Task 4), `db` from `@/lib/db`, `auth` from `@/auth`.
- Produces: `updateReleaseDetails`, `upsertTrack`, `deleteTrack`, `upsertParticipant`, `deleteParticipant`, `submitRelease` — all exported from `src/app/upload/actions.ts`, all Server Actions (`'use server'`). Tasks 6–9's client components call these exact functions with these exact signatures. `getOrCreateDraftRelease` (Task 3) is used directly by Task 6's `page.tsx`, not re-exported from here.

This task is Server Action wiring around already-tested pure functions and straightforward Prisma calls — it ends in a manual verification step rather than a red/green cycle, matching how the artist-auth-foundation plan handled its own integration task (Task 5 there).

- [ ] **Step 1: Write the actions file**

Create `src/app/upload/actions.ts`:

```typescript
'use server'

import { auth } from '@/auth'
import { db } from '@/lib/db'
import { validateSplitPercentages } from '@/lib/validate-split-percentages'

async function requireArtistId(): Promise<string> {
  const session = await auth()
  if (!session?.user?.artistId) {
    throw new Error('Not authenticated')
  }
  return session.user.artistId
}

async function requireOwnedRelease(releaseId: string, artistId: string) {
  const release = await db.release.findUnique({ where: { id: releaseId } })
  if (!release || release.artistId !== artistId) {
    throw new Error('Release not found')
  }
  return release
}

export async function updateReleaseDetails(
  releaseId: string,
  data: {
    title: string
    titleLanguage?: string
    isVersion: boolean
    versionType?: string
    coverUrl?: string
    label?: string
    copyrightHolder?: string
    phonographicHolder?: string
    previouslyDistributed: boolean
  }
) {
  const artistId = await requireArtistId()
  await requireOwnedRelease(releaseId, artistId)

  return db.release.update({
    where: { id: releaseId },
    data,
  })
}

export async function upsertTrack(
  releaseId: string,
  track: {
    id?: string
    title: string
    trackNumber: number
    isrc?: string
    audioFileUrl?: string
    explicit: boolean
  }
) {
  const artistId = await requireArtistId()
  await requireOwnedRelease(releaseId, artistId)

  if (track.id) {
    return db.track.update({
      where: { id: track.id },
      data: {
        title: track.title,
        trackNumber: track.trackNumber,
        isrc: track.isrc,
        audioFileUrl: track.audioFileUrl,
        explicit: track.explicit,
      },
    })
  }

  return db.track.create({
    data: {
      releaseId,
      title: track.title,
      trackNumber: track.trackNumber,
      isrc: track.isrc,
      audioFileUrl: track.audioFileUrl,
      explicit: track.explicit,
    },
  })
}

export async function deleteTrack(releaseId: string, trackId: string) {
  const artistId = await requireArtistId()
  await requireOwnedRelease(releaseId, artistId)

  await db.track.delete({ where: { id: trackId } })
}

export async function upsertParticipant(
  releaseId: string,
  participant: {
    id?: string
    name: string
    email?: string
    role: string
    splitPercent: number
  }
) {
  const artistId = await requireArtistId()
  await requireOwnedRelease(releaseId, artistId)

  const existing = await db.participant.findMany({
    where: {
      releaseId,
      ...(participant.id ? { id: { not: participant.id } } : {}),
    },
  })
  const { valid } = validateSplitPercentages([
    ...existing,
    { splitPercent: participant.splitPercent },
  ])
  if (!valid) {
    throw new Error('Split percentages cannot exceed 100%')
  }

  if (participant.id) {
    return db.participant.update({
      where: { id: participant.id },
      data: {
        name: participant.name,
        email: participant.email,
        role: participant.role,
        splitPercent: participant.splitPercent,
      },
    })
  }

  return db.participant.create({
    data: {
      releaseId,
      name: participant.name,
      email: participant.email,
      role: participant.role,
      splitPercent: participant.splitPercent,
    },
  })
}

export async function deleteParticipant(
  releaseId: string,
  participantId: string
) {
  const artistId = await requireArtistId()
  await requireOwnedRelease(releaseId, artistId)

  await db.participant.delete({ where: { id: participantId } })
}

export async function submitRelease(releaseId: string) {
  const artistId = await requireArtistId()
  const release = await requireOwnedRelease(releaseId, artistId)

  if (!release.title) {
    throw new Error('Release title is required')
  }

  const tracks = await db.track.findMany({ where: { releaseId } })
  if (tracks.length === 0) {
    throw new Error('At least one track is required')
  }

  const participants = await db.participant.findMany({
    where: { releaseId },
  })
  const { valid } = validateSplitPercentages(participants)
  if (!valid) {
    throw new Error('Split percentages cannot exceed 100%')
  }

  return db.release.update({
    where: { id: releaseId },
    data: { status: 'submitted' },
  })
}
```

- [ ] **Step 2: Typecheck**

Run: `npx tsc --noEmit`
Expected: clean (no errors).

- [ ] **Step 3: Commit**

```bash
git add src/app/upload/actions.ts
git commit -m "feat: add Server Actions for the upload wizard"
```

---

### Task 6: Upload wizard shell and Details step

**Files:**
- Create: `src/app/upload/page.tsx`
- Create: `src/app/upload/upload-wizard.tsx`
- Create: `src/app/upload/details-step.tsx`

**Interfaces:**
- Consumes: `getOrCreateDraftRelease`, `updateReleaseDetails` (Task 5), `uploadCoverArt` (Task 1), `auth` from `@/auth`.
- Produces: `<UploadWizard>` client component, rendering step components keyed by a `step` number (0=Details, 1=Tracks, 2=Participants, 3=Review) — Tasks 7–9 add their step components into this same file's step-switch.

- [ ] **Step 1: Write the page (Server Component)**

Create `src/app/upload/page.tsx`:

```tsx
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { getOrCreateDraftRelease } from '@/lib/get-or-create-draft-release'
import { UploadWizard } from './upload-wizard'

export default async function UploadPage() {
  const session = await auth()
  if (!session?.user?.artistId) {
    redirect('/login')
  }

  const release = await getOrCreateDraftRelease(db, session.user.artistId)
  const tracks = await db.track.findMany({
    where: { releaseId: release.id },
    orderBy: { trackNumber: 'asc' },
  })
  const participants = await db.participant.findMany({
    where: { releaseId: release.id },
  })

  const initialStep = !release.title ? 0 : tracks.length === 0 ? 1 : 2

  return (
    <UploadWizard
      release={release}
      tracks={tracks}
      participants={participants}
      initialStep={initialStep}
    />
  )
}
```

- [ ] **Step 2: Write the wizard shell (Client Component)**

Create `src/app/upload/upload-wizard.tsx`:

```tsx
'use client'

import { useState } from 'react'
import type { Participant, Release, Track } from '@prisma/client'
import { DetailsStep } from './details-step'

const STEP_LABELS = ['Details', 'Tracks', 'Participants', 'Review']

export function UploadWizard({
  release,
  tracks,
  participants,
  initialStep,
}: {
  release: Release
  tracks: Track[]
  participants: Participant[]
  initialStep: number
}) {
  const [step, setStep] = useState(initialStep)
  const [currentRelease, setCurrentRelease] = useState(release)
  const [currentTracks, setCurrentTracks] = useState(tracks)
  const [currentParticipants, setCurrentParticipants] = useState(participants)

  return (
    <main className="min-h-screen bg-background text-foreground px-4 py-16">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-2 mb-10 text-sm text-muted-foreground">
          {STEP_LABELS.map((label, i) => (
            <span key={label} className={i === step ? 'text-lime font-semibold' : ''}>
              {label}
              {i < STEP_LABELS.length - 1 && <span className="mx-2">/</span>}
            </span>
          ))}
        </div>

        {step === 0 && (
          <DetailsStep
            release={currentRelease}
            onSaved={(updated) => {
              setCurrentRelease(updated)
              setStep(1)
            }}
          />
        )}

        {step === 1 && (
          <div className="text-muted-foreground">
            Tracks step ({currentTracks.length} tracks so far) — added in the next task.
          </div>
        )}

        {step === 2 && (
          <div className="text-muted-foreground">
            Participants step ({currentParticipants.length} so far) — added in the next task.
          </div>
        )}

        {step === 3 && (
          <div className="text-muted-foreground">Review step — added in a later task.</div>
        )}
      </div>
    </main>
  )
}
```

(The Tracks/Participants/Review placeholders above are replaced by Tasks 7–9 — this task only needs Details to be real and working.)

- [ ] **Step 3: Write the Details step**

Create `src/app/upload/details-step.tsx`:

```tsx
'use client'

import { useState } from 'react'
import type { Release } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { uploadCoverArt } from '@/lib/blob-upload'
import { updateReleaseDetails } from './actions'

export function DetailsStep({
  release,
  onSaved,
}: {
  release: Release
  onSaved: (release: Release) => void
}) {
  const [title, setTitle] = useState(release.title)
  const [label, setLabel] = useState(release.label ?? '')
  const [coverArtUrl, setCoverArtUrl] = useState(release.coverUrl ?? '')
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleCoverArtChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError(null)
    try {
      const url = await uploadCoverArt(file)
      setCoverArtUrl(url)
    } catch {
      setError('Cover art upload failed. Please try a different file.')
    } finally {
      setUploading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const updated = await updateReleaseDetails(release.id, {
        title,
        isVersion: false,
        label,
        coverUrl: coverArtUrl || undefined,
        previouslyDistributed: false,
      })
      onSaved(updated)
    } catch {
      setError('Could not save. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h1 className="text-2xl font-bold mb-6">Release details</h1>

      <label htmlFor="title" className="block text-sm font-medium mb-1">
        Release title
      </label>
      <input
        id="title"
        required
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full rounded-md border border-border bg-surface px-4 py-2 mb-4 text-sm"
      />

      <label htmlFor="label" className="block text-sm font-medium mb-1">
        Label
      </label>
      <input
        id="label"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        className="w-full rounded-md border border-border bg-surface px-4 py-2 mb-4 text-sm"
      />

      <label htmlFor="cover-art" className="block text-sm font-medium mb-1">
        Cover art
      </label>
      <p className="text-xs text-muted-foreground mb-2">
        JPEG, PNG, or TIFF — square, 3000&ndash;5000px, RGB, under 36MB.
      </p>
      <input
        id="cover-art"
        type="file"
        accept="image/jpeg,image/png,image/tiff"
        onChange={handleCoverArtChange}
        className="mb-4 text-sm"
      />
      {coverArtUrl && (
        <p className="text-xs text-lime mb-4">Cover art uploaded.</p>
      )}

      {error && <p className="text-sm text-destructive mb-4">{error}</p>}

      <Button type="submit" disabled={saving || uploading}>
        {saving ? 'Saving…' : 'Continue'}
      </Button>
    </form>
  )
}
```

- [ ] **Step 4: Typecheck**

Run: `npx tsc --noEmit`
Expected: clean.

- [ ] **Step 5: Manual verification**

```bash
npm run dev
```

Sign in at `/login` (using a real magic-link click, or manually set a session cookie if Resend isn't configured yet — note in your report which path you used), then visit `/upload`. Confirm the Details step renders, fill in a title, submit, and confirm it advances to the Tracks placeholder without a console error. Stop the dev server after confirming.

- [ ] **Step 6: Commit**

```bash
git add src/app/upload/page.tsx src/app/upload/upload-wizard.tsx src/app/upload/details-step.tsx
git commit -m "feat: add upload wizard shell and Details step"
```

---

### Task 7: Tracks step

**Files:**
- Create: `src/app/upload/tracks-step.tsx`
- Modify: `src/app/upload/upload-wizard.tsx:` (replace the Tracks placeholder block with `<TracksStep>`)

**Interfaces:**
- Consumes: `upsertTrack`, `deleteTrack` (Task 5), `uploadAudioFile` (Task 1).
- Produces: `<TracksStep>`, calling `onSaved(tracks: Track[])` when the artist clicks Continue.

- [ ] **Step 1: Write the Tracks step**

Create `src/app/upload/tracks-step.tsx`:

```tsx
'use client'

import { useState } from 'react'
import type { Track } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { uploadAudioFile } from '@/lib/blob-upload'
import { deleteTrack, upsertTrack } from './actions'

export function TracksStep({
  releaseId,
  tracks,
  onSaved,
}: {
  releaseId: string
  tracks: Track[]
  onSaved: (tracks: Track[]) => void
}) {
  const [currentTracks, setCurrentTracks] = useState(tracks)
  const [newTitle, setNewTitle] = useState('')
  const [uploadingIndex, setUploadingIndex] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleAddTrack() {
    if (!newTitle.trim()) return
    const created = await upsertTrack(releaseId, {
      title: newTitle.trim(),
      trackNumber: currentTracks.length + 1,
      explicit: false,
    })
    setCurrentTracks([...currentTracks, created])
    setNewTitle('')
  }

  async function handleRemoveTrack(track: Track) {
    await deleteTrack(releaseId, track.id)
    setCurrentTracks(currentTracks.filter((t) => t.id !== track.id))
  }

  async function handleAudioFile(track: Track, index: number, file: File) {
    setUploadingIndex(index)
    setError(null)
    try {
      const audioFileUrl = await uploadAudioFile(file)
      const updated = await upsertTrack(releaseId, {
        id: track.id,
        title: track.title,
        trackNumber: track.trackNumber,
        isrc: track.isrc ?? undefined,
        audioFileUrl,
        explicit: track.explicit,
      })
      setCurrentTracks(
        currentTracks.map((t) => (t.id === updated.id ? updated : t))
      )
    } catch {
      setError('Audio upload failed. Please try a different file.')
    } finally {
      setUploadingIndex(null)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Tracks</h1>

      <ul className="space-y-3 mb-6">
        {currentTracks.map((track, i) => (
          <li key={track.id} className="glass-card rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-sm">
                {track.trackNumber}. {track.title}
              </span>
              <button
                type="button"
                onClick={() => handleRemoveTrack(track)}
                className="text-xs text-muted-foreground hover:text-destructive"
              >
                Remove
              </button>
            </div>
            <input
              type="file"
              accept="audio/wav,audio/x-wav,audio/flac,audio/x-flac,audio/aiff,audio/x-aiff"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleAudioFile(track, i, file)
              }}
              className="text-xs"
            />
            {uploadingIndex === i && (
              <p className="text-xs text-muted-foreground mt-1">Uploading…</p>
            )}
            {track.audioFileUrl && uploadingIndex !== i && (
              <p className="text-xs text-lime mt-1">Audio uploaded.</p>
            )}
          </li>
        ))}
      </ul>

      <div className="flex gap-2 mb-6">
        <input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Track title"
          className="flex-1 rounded-md border border-border bg-surface px-4 py-2 text-sm"
        />
        <Button type="button" variant="outline" onClick={handleAddTrack}>
          Add track
        </Button>
      </div>

      {error && <p className="text-sm text-destructive mb-4">{error}</p>}

      <Button
        type="button"
        disabled={currentTracks.length === 0}
        onClick={() => onSaved(currentTracks)}
      >
        Continue
      </Button>
    </div>
  )
}
```

- [ ] **Step 2: Wire it into the wizard**

In `src/app/upload/upload-wizard.tsx`, add the import:

```typescript
import { TracksStep } from './tracks-step'
```

Replace the `{step === 1 && (...)}` placeholder block with:

```tsx
{step === 1 && (
  <TracksStep
    releaseId={currentRelease.id}
    tracks={currentTracks}
    onSaved={(updated) => {
      setCurrentTracks(updated)
      setStep(2)
    }}
  />
)}
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: clean.

- [ ] **Step 4: Manual verification**

```bash
npm run dev
```

Visit `/upload` (resuming the draft from Task 6's manual test), add a track by title, confirm it appears in the list and "Continue" becomes enabled only once at least one track exists. Stop the dev server after confirming.

- [ ] **Step 5: Commit**

```bash
git add src/app/upload/tracks-step.tsx src/app/upload/upload-wizard.tsx
git commit -m "feat: add Tracks step to upload wizard"
```

---

### Task 8: Participants step

**Files:**
- Create: `src/app/upload/participants-step.tsx`
- Modify: `src/app/upload/upload-wizard.tsx` (replace the Participants placeholder block with `<ParticipantsStep>`)

**Interfaces:**
- Consumes: `upsertParticipant`, `deleteParticipant` (Task 5), `validateSplitPercentages` (Task 4, for the client-side running-total display only — the server action is the actual enforcement).
- Produces: `<ParticipantsStep>`, calling `onSaved(participants: Participant[])` when the artist clicks Continue.

- [ ] **Step 1: Write the Participants step**

Create `src/app/upload/participants-step.tsx`:

```tsx
'use client'

import { useState } from 'react'
import type { Participant } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { validateSplitPercentages } from '@/lib/validate-split-percentages'
import { deleteParticipant, upsertParticipant } from './actions'

export function ParticipantsStep({
  releaseId,
  participants,
  onSaved,
}: {
  releaseId: string
  participants: Participant[]
  onSaved: (participants: Participant[]) => void
}) {
  const [current, setCurrent] = useState(participants)
  const [name, setName] = useState('')
  const [role, setRole] = useState('artist')
  const [splitPercent, setSplitPercent] = useState(100)
  const [error, setError] = useState<string | null>(null)

  const { total } = validateSplitPercentages(current)

  async function handleAdd() {
    if (!name.trim()) return
    setError(null)
    try {
      const created = await upsertParticipant(releaseId, {
        name: name.trim(),
        role,
        splitPercent,
      })
      setCurrent([...current, created])
      setName('')
      setSplitPercent(0)
    } catch {
      setError('Split percentages cannot exceed 100%.')
    }
  }

  async function handleRemove(participant: Participant) {
    await deleteParticipant(releaseId, participant.id)
    setCurrent(current.filter((p) => p.id !== participant.id))
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-2">Collaborators</h1>
      <p className="text-sm text-muted-foreground mb-6">
        Split percentages so far: {total}%
      </p>

      <ul className="space-y-2 mb-6">
        {current.map((p) => (
          <li
            key={p.id}
            className="glass-card rounded-xl p-4 flex items-center justify-between"
          >
            <span className="text-sm font-medium">
              {p.name} — {p.role} ({p.splitPercent}%)
            </span>
            <button
              type="button"
              onClick={() => handleRemove(p)}
              className="text-xs text-muted-foreground hover:text-destructive"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Name"
          className="rounded-md border border-border bg-surface px-4 py-2 text-sm"
        />
        <select
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="rounded-md border border-border bg-surface px-4 py-2 text-sm"
        >
          <option value="artist">Artist</option>
          <option value="producer">Producer</option>
          <option value="featured">Featured</option>
        </select>
        <input
          type="number"
          min={0}
          max={100}
          value={splitPercent}
          onChange={(e) => setSplitPercent(Number(e.target.value))}
          className="rounded-md border border-border bg-surface px-4 py-2 text-sm"
        />
      </div>

      <Button type="button" variant="outline" onClick={handleAdd} className="mb-6">
        Add collaborator
      </Button>

      {error && <p className="text-sm text-destructive mb-4">{error}</p>}

      <div>
        <Button type="button" onClick={() => onSaved(current)}>
          Continue
        </Button>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Wire it into the wizard**

In `src/app/upload/upload-wizard.tsx`, add the import:

```typescript
import { ParticipantsStep } from './participants-step'
```

Replace the `{step === 2 && (...)}` placeholder block with:

```tsx
{step === 2 && (
  <ParticipantsStep
    releaseId={currentRelease.id}
    participants={currentParticipants}
    onSaved={(updated) => {
      setCurrentParticipants(updated)
      setStep(3)
    }}
  />
)}
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: clean.

- [ ] **Step 4: Manual verification**

```bash
npm run dev
```

Visit `/upload`, progress to the Participants step, add a collaborator at 60%, add a second at 50% and confirm it's rejected (running total would exceed 100%), then add one at 40% and confirm it succeeds. Stop the dev server after confirming.

- [ ] **Step 5: Commit**

```bash
git add src/app/upload/participants-step.tsx src/app/upload/upload-wizard.tsx
git commit -m "feat: add Participants step to upload wizard"
```

---

### Task 9: Review step and final submit

**Files:**
- Create: `src/app/upload/review-step.tsx`
- Modify: `src/app/upload/upload-wizard.tsx` (replace the Review placeholder block with `<ReviewStep>`)

**Interfaces:**
- Consumes: `submitRelease` (Task 5).
- Produces: nothing further downstream — this is the last step of subsystem 2a.

- [ ] **Step 1: Write the Review step**

Create `src/app/upload/review-step.tsx`:

```tsx
'use client'

import { useState } from 'react'
import type { Participant, Release, Track } from '@prisma/client'
import { Button } from '@/components/ui/button'
import { submitRelease } from './actions'

export function ReviewStep({
  release,
  tracks,
  participants,
}: {
  release: Release
  tracks: Track[]
  participants: Participant[]
}) {
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit() {
    setSubmitting(true)
    setError(null)
    try {
      await submitRelease(release.id)
      setSubmitted(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not submit.')
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-2">Submitted</h1>
        <p className="text-muted-foreground">
          &quot;{release.title}&quot; is in — we&apos;ll take it from here.
        </p>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Review</h1>

      <div className="glass-card rounded-xl p-4 mb-4">
        <h2 className="font-semibold mb-1">{release.title || 'Untitled release'}</h2>
        <p className="text-sm text-muted-foreground">{release.label}</p>
      </div>

      <div className="glass-card rounded-xl p-4 mb-4">
        <h3 className="font-semibold mb-2 text-sm">Tracks ({tracks.length})</h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          {tracks.map((t) => (
            <li key={t.id}>
              {t.trackNumber}. {t.title}
              {!t.audioFileUrl && ' — no audio file uploaded'}
            </li>
          ))}
        </ul>
      </div>

      <div className="glass-card rounded-xl p-4 mb-6">
        <h3 className="font-semibold mb-2 text-sm">
          Collaborators ({participants.length})
        </h3>
        <ul className="text-sm text-muted-foreground space-y-1">
          {participants.map((p) => (
            <li key={p.id}>
              {p.name} — {p.role} ({p.splitPercent}%)
            </li>
          ))}
        </ul>
      </div>

      {error && <p className="text-sm text-destructive mb-4">{error}</p>}

      <Button type="button" onClick={handleSubmit} disabled={submitting}>
        {submitting ? 'Submitting…' : 'Submit release'}
      </Button>
    </div>
  )
}
```

- [ ] **Step 2: Wire it into the wizard**

In `src/app/upload/upload-wizard.tsx`, add the import:

```typescript
import { ReviewStep } from './review-step'
```

Replace the `{step === 3 && (...)}` placeholder block with:

```tsx
{step === 3 && (
  <ReviewStep
    release={currentRelease}
    tracks={currentTracks}
    participants={currentParticipants}
  />
)}
```

- [ ] **Step 3: Typecheck**

Run: `npx tsc --noEmit`
Expected: clean.

- [ ] **Step 4: Manual verification**

```bash
npm run dev
```

Walk through all 4 steps end to end for a fresh draft (title → one track → one 100%-split participant → review → submit). Confirm the Review step shows the entered data correctly and "Submit release" succeeds, showing the submitted confirmation. Then check the database directly (`npx prisma studio` or a quick query) to confirm `Release.status` is now `"submitted"`. Stop the dev server after confirming.

- [ ] **Step 5: Commit**

```bash
git add src/app/upload/review-step.tsx src/app/upload/upload-wizard.tsx
git commit -m "feat: add Review step and final submit to upload wizard"
```

---

## After this plan

- **Manual, one-time setup outside this codebase**: create a Blob store in the Vercel dashboard for this project (Storage → Create Database → Blob), then `vercel env pull` (or manually set `BLOB_READ_WRITE_TOKEN` in `.env`/`.env.local`) so uploads work locally and in deployed environments. Nothing in this plan's tasks works end-to-end without this — Task 1's test is fully mocked and doesn't need it, but Tasks 6–9's manual verification steps do.
- Subsystem 2b (SonoSuite Bulk Upload CSV generation) is next once Bulk Upload is confirmed enabled on the SonoSuite account (currently `Assigned`/`Enabled` are both off in Setup → Options).
- Track reordering, multi-draft support, and post-submit editing are explicitly out of scope per the spec — revisit only if a real need shows up.
