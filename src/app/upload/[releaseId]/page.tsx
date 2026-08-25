import { notFound, redirect } from 'next/navigation'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { loadReleaseForWizard } from '@/lib/load-release-for-wizard'
import { UploadWizard } from '../upload-wizard'

export default async function EditReleasePage({
  params,
}: {
  params: Promise<{ releaseId: string }>
}) {
  const session = await auth()
  if (!session?.user?.artistId) {
    redirect('/login')
  }

  const { releaseId } = await params
  const release = await db.release.findUnique({ where: { id: releaseId } })
  if (!release || release.artistId !== session.user.artistId) {
    notFound()
  }

  const { tracks, participants, initialStep } = await loadReleaseForWizard(db, release)

  return (
    <UploadWizard
      release={release}
      tracks={tracks}
      participants={participants}
      initialStep={initialStep}
    />
  )
}
