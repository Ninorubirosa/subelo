import { describe, expect, it } from 'vitest'
import { GET } from '@/app/admin/sonosuite-logout/route'

describe('GET /admin/sonosuite-logout', () => {
  it('redirects to /admin', async () => {
    const request = new Request('https://subelodistro.com/admin/sonosuite-logout')
    const response = await GET(request)
    expect(response.status).toBe(307)
    expect(response.headers.get('location')).toBe('https://subelodistro.com/admin')
  })
})
