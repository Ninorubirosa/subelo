import { SignJWT } from 'jose'

export async function buildSonoSuiteLoginUrl(email: string): Promise<string> {
  const secret = process.env.SONOSUITE_SSO_SECRET
  const loginUrl = process.env.SONOSUITE_LOGIN_URL
  if (!secret) throw new Error('SONOSUITE_SSO_SECRET is not set')
  if (!loginUrl) throw new Error('SONOSUITE_LOGIN_URL is not set')

  const token = await new SignJWT({ email })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('60s')
    .sign(new TextEncoder().encode(secret))

  const url = new URL(loginUrl)
  url.searchParams.set('token', token)
  return url.toString()
}
