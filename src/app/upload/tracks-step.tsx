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
    setError(null)
    try {
      const nextTrackNumber =
        currentTracks.length === 0
          ? 1
          : Math.max(...currentTracks.map((t) => t.trackNumber)) + 1
      const created = await upsertTrack(releaseId, {
        title: newTitle.trim(),
        trackNumber: nextTrackNumber,
        explicit: false,
      })
      setCurrentTracks((prev) => [...prev, created])
      setNewTitle('')
    } catch {
      setError('Could not add track. Please try again.')
    }
  }

  async function handleRemoveTrack(track: Track) {
    setError(null)
    try {
      await deleteTrack(releaseId, track.id)
      setCurrentTracks((prev) => prev.filter((t) => t.id !== track.id))
    } catch {
      setError('Could not remove track. Please try again.')
    }
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
      setCurrentTracks((prev) =>
        prev.map((t) => (t.id === updated.id ? updated : t))
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
