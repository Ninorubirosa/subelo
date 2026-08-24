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
