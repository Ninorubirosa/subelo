import { NextResponse } from 'next/server'
import { auth } from '@/auth'
import { isStaffEmail } from '@/lib/is-staff'
import { buildSonoSuiteLoginUrl } from '@/lib/sonosuite-sso'

export async function GET() {
  const session = await auth()
  if (!isStaffEmail(session?.user?.email)) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 })
  }

  try {
    const url = await buildSonoSuiteLoginUrl(session!.user!.email!)
    return NextResponse.redirect(url)
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    )
  }
}
