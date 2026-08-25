import { PrismaClient } from '@prisma/client'
import path from 'node:path'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import { createArtistForUser } from '@/lib/create-artist-for-user'

const testDbPath = path.join(process.cwd(), 'prisma', 'test.db')
const prisma = new PrismaClient({ datasourceUrl: `file:${testDbPath}` })

const testEmails = ['nova@example.com', 'echo@example.com']

beforeAll(async () => {
  await prisma.artist.deleteMany({ where: { user: { email: { in: testEmails } } } })
  await prisma.user.deleteMany({ where: { email: { in: testEmails } } })
})

afterAll(async () => {
  await prisma.$disconnect()
})

describe('createArtistForUser', () => {
  it('creates one Artist for a new User, derived from their email', async () => {
    const user = await prisma.user.create({
      data: { email: 'nova@example.com' },
    })

    const artist = await createArtistForUser(prisma, user.id)

    expect(artist.userId).toBe(user.id)
    expect(artist.name).toBe('nova')
  })

  it('is idempotent — calling it twice never creates a duplicate Artist', async () => {
    const user = await prisma.user.create({
      data: { email: 'echo@example.com' },
    })

    await createArtistForUser(prisma, user.id)
    await createArtistForUser(prisma, user.id)

    const count = await prisma.artist.count({ where: { userId: user.id } })
    expect(count).toBe(1)
  })
})
