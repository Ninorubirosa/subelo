import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { jwtVerify } from 'jose'
import { buildSonoSuiteLoginUrl } from '@/lib/sonosuite-sso'

describe('buildSonoSuiteLoginUrl', () => {
  const originalSecret = process.env.SONOSUITE_SSO_SECRET
  const originalLoginUrl = process.env.SONOSUITE_LOGIN_URL

  beforeEach(() => {
    process.env.SONOSUITE_SSO_SECRET = 'test-secret-value'
    process.env.SONOSUITE_LOGIN_URL = 'https://sablatino.sonosuite.com/sso/login'
  })

  afterEach(() => {
    process.env.SONOSUITE_SSO_SECRET = originalSecret
    process.env.SONOSUITE_LOGIN_URL = originalLoginUrl
  })

  it('returns a URL under SONOSUITE_LOGIN_URL with a token param', async () => {
    const url = await buildSonoSuiteLoginUrl('staff@subelo.com')
    expect(url.startsWith('https://sablatino.sonosuite.com/sso/login')).toBe(true)
    const parsed = new URL(url)
    expect(parsed.searchParams.get('token')).toBeTruthy()
  })

  it('signs a token containing the email with a 60s expiry', async () => {
    const url = await buildSonoSuiteLoginUrl('staff@subelo.com')
    const token = new URL(url).searchParams.get('token')!
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode('test-secret-value')
    )
    expect(payload.email).toBe('staff@subelo.com')
    expect((payload.exp as number) - (payload.iat as number)).toBe(60)
  })

  it('throws if SONOSUITE_SSO_SECRET is missing', async () => {
    delete process.env.SONOSUITE_SSO_SECRET
    await expect(buildSonoSuiteLoginUrl('staff@subelo.com')).rejects.toThrow(
      'SONOSUITE_SSO_SECRET is not set'
    )
  })

  it('throws if SONOSUITE_LOGIN_URL is missing', async () => {
    delete process.env.SONOSUITE_LOGIN_URL
    await expect(buildSonoSuiteLoginUrl('staff@subelo.com')).rejects.toThrow(
      'SONOSUITE_LOGIN_URL is not set'
    )
  })
})
