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
