'use client'

import { useState } from 'react'
import type { Participant, Release, Track } from '@prisma/client'
import { DetailsStep } from './details-step'
import { TracksStep } from './tracks-step'
import { ParticipantsStep } from './participants-step'
import { ReviewStep } from './review-step'

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
  const [maxStepReached, setMaxStepReached] = useState(initialStep)
  const [currentRelease, setCurrentRelease] = useState(release)
  const [currentTracks, setCurrentTracks] = useState(tracks)
  const [currentParticipants, setCurrentParticipants] = useState(participants)

  function goToStep(next: number) {
    setStep(next)
    setMaxStepReached((prev) => Math.max(prev, next))
  }

  return (
    <main className="min-h-screen bg-background text-foreground px-4 py-16">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-2 mb-10 text-sm text-muted-foreground">
          {STEP_LABELS.map((label, i) => (
            <span key={label} className="flex items-center">
              <button
                type="button"
                onClick={() => i <= maxStepReached && goToStep(i)}
                disabled={i > maxStepReached}
                className={
                  i === step
                    ? 'text-lime font-semibold'
                    : i <= maxStepReached
                      ? 'hover:text-foreground cursor-pointer'
                      : 'cursor-not-allowed opacity-50'
                }
              >
                {label}
              </button>
              {i < STEP_LABELS.length - 1 && <span className="mx-2">/</span>}
            </span>
          ))}
        </div>

        {step === 0 && (
          <DetailsStep
            release={currentRelease}
            onSaved={(updated) => {
              setCurrentRelease(updated)
              goToStep(1)
            }}
          />
        )}

        {step === 1 && (
          <TracksStep
            releaseId={currentRelease.id}
            tracks={currentTracks}
            onSaved={(updated) => {
              setCurrentTracks(updated)
              goToStep(2)
            }}
          />
        )}

        {step === 2 && (
          <ParticipantsStep
            releaseId={currentRelease.id}
            participants={currentParticipants}
            onSaved={(updated) => {
              setCurrentParticipants(updated)
              goToStep(3)
            }}
          />
        )}

        {step === 3 && (
          <ReviewStep
            release={currentRelease}
            tracks={currentTracks}
            participants={currentParticipants}
          />
        )}
      </div>
    </main>
  )
}
