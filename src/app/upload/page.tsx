import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { getOrCreateDraftRelease } from '@/lib/get-or-create-draft-release'
import { UploadWizard } from './upload-wizard'

export default async function UploadPage() {
  const session = await auth()
  if (!session?.user?.artistId) {
    redirect('/login')
  }

  const release = await getOrCreateDraftRelease(db, session.user.artistId)
  const tracks = await db.track.findMany({
    where: { releaseId: release.id },
    orderBy: { trackNumber: 'asc' },
  })
  const participants = await db.participant.findMany({
    where: { releaseId: release.id },
  })

  const initialStep = !release.title ? 0 : tracks.length === 0 ? 1 : 2

  return (
    <UploadWizard
      release={release}
      tracks={tracks}
      participants={participants}
      initialStep={initialStep}
    />
  )
}
