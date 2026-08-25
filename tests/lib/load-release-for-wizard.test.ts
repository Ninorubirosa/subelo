import { PrismaClient } from '@prisma/client'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { loadReleaseForWizard } from '@/lib/load-release-for-wizard'

const prisma = new PrismaClient()

let artistId: string

beforeAll(async () => {
  await prisma.user.deleteMany({
    where: { email: 'load-release-wizard-test@example.com' },
  })

  const user = await prisma.user.create({
    data: { email: 'load-release-wizard-test@example.com' },
  })
  const artist = await prisma.artist.create({
    data: { userId: user.id, name: 'Load Release Wizard Test Artist' },
  })
  artistId = artist.id
})

afterAll(async () => {
  await prisma.release.deleteMany({ where: { artistId } })
  await prisma.artist.delete({ where: { id: artistId } })
  await prisma.user.deleteMany({
    where: { email: 'load-release-wizard-test@example.com' },
  })
  await prisma.$disconnect()
})

describe('loadReleaseForWizard', () => {
  it('opens on the Details step (0) when the release has no title', async () => {
    const release = await prisma.release.create({
      data: { artistId, title: '', status: 'draft' },
    })
    const result = await loadReleaseForWizard(prisma, release)
    expect(result.initialStep).toBe(0)
    expect(result.tracks).toEqual([])
    expect(result.participants).toEqual([])
  })

  it('opens on the Tracks step (1) when there is a title but no tracks', async () => {
    const release = await prisma.release.create({
      data: { artistId, title: 'Has Title', status: 'draft' },
    })
    const result = await loadReleaseForWizard(prisma, release)
    expect(result.initialStep).toBe(1)
  })

  it('opens on the Participants step (2) when there is a title and tracks', async () => {
    const release = await prisma.release.create({
      data: { artistId, title: 'Has Title And Track', status: 'draft' },
    })
    await prisma.track.create({
      data: { releaseId: release.id, title: 'Track 1', trackNumber: 1 },
    })
    const result = await loadReleaseForWizard(prisma, release)
    expect(result.initialStep).toBe(2)
    expect(result.tracks).toHaveLength(1)
  })
})
