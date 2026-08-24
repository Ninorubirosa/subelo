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
