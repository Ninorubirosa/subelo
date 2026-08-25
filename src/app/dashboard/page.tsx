import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { DashboardPreview } from '@/components/landing/DashboardPreview'

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.artistId) {
    redirect('/login')
  }

  return <DashboardPreview />
}
