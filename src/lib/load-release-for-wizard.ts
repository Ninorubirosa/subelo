import type { PrismaClient, Release } from '@prisma/client'

export async function loadReleaseForWizard(prisma: PrismaClient, release: Release) {
  const tracks = await prisma.track.findMany({
    where: { releaseId: release.id },
    orderBy: { trackNumber: 'asc' },
  })
  const participants = await prisma.participant.findMany({
    where: { releaseId: release.id },
  })

  const initialStep = !release.title ? 0 : tracks.length === 0 ? 1 : 2

  return { tracks, participants, initialStep }
}
