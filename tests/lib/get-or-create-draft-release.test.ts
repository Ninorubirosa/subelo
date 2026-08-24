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
