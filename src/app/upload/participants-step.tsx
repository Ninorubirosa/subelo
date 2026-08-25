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
      setCurrent((prev) => [...prev, created])
      setName('')
      setSplitPercent(0)
    } catch {
      setError('Split percentages cannot exceed 100%.')
    }
  }

  async function handleRemove(participant: Participant) {
    setError(null)
    try {
      await deleteParticipant(releaseId, participant.id)
      setCurrent((prev) => prev.filter((p) => p.id !== participant.id))
    } catch {
      setError('Could not remove collaborator. Please try again.')
    }
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
        <div>
          <label htmlFor="participant-name" className="sr-only">
            Name
          </label>
          <input
            id="participant-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            className="w-full rounded-md border border-border bg-surface px-4 py-2 text-sm"
          />
        </div>
        <div>
          <label htmlFor="participant-role" className="sr-only">
            Role
          </label>
          <select
            id="participant-role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full rounded-md border border-border bg-surface px-4 py-2 text-sm"
          >
            <option value="artist">Artist</option>
            <option value="producer">Producer</option>
            <option value="featured">Featured</option>
          </select>
        </div>
        <div>
          <label htmlFor="participant-split" className="sr-only">
            Split percent
          </label>
          <input
            id="participant-split"
            type="number"
            min={0}
            max={100}
            value={splitPercent}
            onChange={(e) => setSplitPercent(Number(e.target.value))}
            className="w-full rounded-md border border-border bg-surface px-4 py-2 text-sm"
          />
        </div>
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
