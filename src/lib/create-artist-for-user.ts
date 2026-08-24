import type { Artist, PrismaClient } from '@prisma/client'

export async function createArtistForUser(
  prisma: PrismaClient,
  userId: string
): Promise<Artist> {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } })
  const defaultName = user.email.split('@')[0]

  return prisma.artist.upsert({
    where: { userId },
    update: {},
    create: {
      userId,
      name: defaultName,
    },
  })
}
