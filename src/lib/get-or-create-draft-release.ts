import type { PrismaClient, Release } from '@prisma/client'

export async function getOrCreateDraftRelease(
  prisma: PrismaClient,
  artistId: string
): Promise<Release> {
  const existingDraft = await prisma.release.findFirst({
    where: { artistId, status: 'draft' },
    orderBy: { createdAt: 'desc' },
  })

  if (existingDraft) {
    return existingDraft
  }

  return prisma.release.create({
    data: {
      artistId,
      title: '',
      status: 'draft',
    },
  })
}
