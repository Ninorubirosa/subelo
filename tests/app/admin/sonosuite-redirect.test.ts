import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}))

import { auth } from '@/auth'
import { GET } from '@/app/admin/sonosuite-redirect/route'

describe('GET /admin/sonosuite-redirect', () => {
  const originalSecret = process.env.SONOSUITE_SSO_SECRET
  const originalLoginUrl = process.env.SONOSUITE_LOGIN_URL
  const originalStaff = process.env.STAFF_EMAILS

  beforeEach(() => {
    process.env.SONOSUITE_SSO_SECRET = 'test-secret'
    process.env.SONOSUITE_LOGIN_URL = 'https://sablatino.sonosuite.com/sso/login'
    process.env.STAFF_EMAILS = 'staff@subelo.com'
  })

  afterEach(() => {
    process.env.SONOSUITE_SSO_SECRET = originalSecret
    process.env.SONOSUITE_LOGIN_URL = originalLoginUrl
    process.env.STAFF_EMAILS = originalStaff
    vi.mocked(auth).mockReset()
  })

  it('redirects a staff session to the SonoSuite login URL', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { email: 'staff@subelo.com' },
    } as unknown as Awaited<ReturnType<typeof auth>>)

    const response = await GET()
    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toContain(
      'https://sablatino.sonosuite.com/sso/login'
    )
  })

  it('returns 403 for a non-staff session', async () => {
    vi.mocked(auth).mockResolvedValue({
      user: { email: 'artist@example.com' },
    } as unknown as Awaited<ReturnType<typeof auth>>)

    const response = await GET()
    expect(response.status).toBe(403)
  })

  it('returns 403 when unauthenticated', async () => {
    vi.mocked(auth).mockResolvedValue(null)
    const response = await GET()
    expect(response.status).toBe(403)
  })
})
