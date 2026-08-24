import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { sendMagicLinkEmail } from '@/lib/send-magic-link-email'

describe('sendMagicLinkEmail', () => {
  beforeEach(() => {
    vi.stubEnv('AUTH_RESEND_KEY', 'test-key')
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it('POSTs the link to Resend with the right recipient and auth header', async () => {
    vi.mocked(fetch).mockResolvedValue(new Response(null, { status: 200 }))

    await sendMagicLinkEmail({
      to: 'nova@example.com',
      url: 'https://subelodistro.com/api/auth/callback/resend?token=abc',
    })

    expect(fetch).toHaveBeenCalledWith(
      'https://api.resend.com/emails',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer test-key',
          'Content-Type': 'application/json',
        }),
      })
    )

    const body = JSON.parse(vi.mocked(fetch).mock.calls[0][1]!.body as string)
    expect(body.to).toBe('nova@example.com')
    expect(body.html).toContain('https://subelodistro.com/api/auth/callback/resend?token=abc')
  })

  it('throws when the Resend API responds with an error', async () => {
    vi.mocked(fetch).mockResolvedValue(new Response('bad request', { status: 400 }))

    await expect(
      sendMagicLinkEmail({ to: 'nova@example.com', url: 'https://example.com' })
    ).rejects.toThrow()
  })
})
