import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'
import { db } from '@/lib/db'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export default async function DashboardPage() {
  const session = await auth()
  if (!session?.user?.artistId) {
    redirect('/login')
  }

  const releases = await db.release.findMany({
    where: { artistId: session.user.artistId },
    include: { tracks: true },
    orderBy: { createdAt: 'desc' },
  })

  return (
    <main className="min-h-screen bg-background text-foreground px-4 py-16">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-10">
          <h1 className="text-2xl font-bold">My Releases</h1>
          <Button asChild>
            <Link href="/upload">New release</Link>
          </Button>
        </div>

        {releases.length === 0 ? (
          <div className="glass-card rounded-xl p-6 text-center">
            <p className="text-muted-foreground mb-4">
              You haven&apos;t started a release yet.
            </p>
            <Button asChild>
              <Link href="/upload">Create your first release</Link>
            </Button>
          </div>
        ) : (
          <ul className="space-y-3">
            {releases.map((release) => (
              <li key={release.id}>
                <Link
                  href={`/upload/${release.id}`}
                  className="glass-card rounded-xl p-4 flex items-center justify-between hover:border-lime/30 transition-colors block"
                >
                  <div>
                    <h2 className="font-semibold">
                      {release.title || 'Untitled release'}
                    </h2>
                    <p className="text-sm text-muted-foreground">
                      {release.tracks.length} track
                      {release.tracks.length === 1 ? '' : 's'}
                    </p>
                  </div>
                  <Badge variant="outline">{release.status}</Badge>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  )
}
