import { afterAll, describe, expect, it } from 'vitest'
import { db } from '@/lib/db'

describe('db.ts regression: the app\'s real Prisma client must see the Auth.js schema', () => {
  const identifier = 'db-schema-regression-test@example.com'
  const token = 'db-schema-regression-test-token'

  afterAll(async () => {
    await db.verificationToken
      .delete({ where: { identifier_token: { identifier, token } } })
      .catch(() => {})
  })

  it('can create and read a VerificationToken row via the app\'s real db singleton', async () => {
    await db.verificationToken.create({
      data: { identifier, token, expires: new Date(Date.now() + 60_000) },
    })

    const found = await db.verificationToken.findUnique({
      where: { identifier_token: { identifier, token } },
    })

    expect(found).not.toBeNull()
    expect(found?.identifier).toBe(identifier)
  })
})
