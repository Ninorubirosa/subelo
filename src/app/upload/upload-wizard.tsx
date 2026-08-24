'use client'

import { useState } from 'react'
import type { Participant, Release, Track } from '@prisma/client'
import { DetailsStep } from './details-step'
import { TracksStep } from './tracks-step'
import { ParticipantsStep } from './participants-step'

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
          <TracksStep
            releaseId={currentRelease.id}
            tracks={currentTracks}
            onSaved={(updated) => {
              setCurrentTracks(updated)
              setStep(2)
            }}
          />
        )}

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

        {step === 3 && (
          <div className="text-muted-foreground">Review step — added in a later task.</div>
        )}
      </div>
    </main>
  )
}
