import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { isStaffEmail } from '@/lib/is-staff'

export default async function AdminPage() {
  const session = await auth()
  if (!session) {
    redirect('/login')
  }

  if (!isStaffEmail(session.user?.email)) {
    return (
      <main className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
        <p className="text-muted-foreground">Not authorized.</p>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center px-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-6">Staff</h1>
        <a
          href="/admin/sonosuite-redirect"
          className="inline-block rounded-md bg-lime px-6 py-3 text-sm font-semibold text-background"
        >
          Open SonoSuite
        </a>
      </div>
    </main>
  )
}
