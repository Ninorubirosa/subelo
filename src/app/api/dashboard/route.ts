import { db } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const artists = await db.artist.findMany({
      include: {
        releases: {
          where: { status: 'live' },
          include: {
            platformStatuses: { include: { platform: true } },
            earnings: true,
          },
        },
      },
    })

    const allEarnings = await db.earning.findMany({
      include: { release: true },
    })

    const platforms = await db.platform.findMany({
      include: {
        statuses: {
          include: { release: { include: { artist: true } } },
        },
      },
    })

    const releases = await db.release.findMany({
      where: { status: 'live' },
      include: { artist: true, platformStatuses: true, earnings: true },
      orderBy: { releaseDate: 'desc' },
    })

    // Aggregate earnings by month
    const monthlyEarnings: Record<string, number> = {}
    const monthlyStreams: Record<string, number> = {}
    for (const e of allEarnings) {
      monthlyEarnings[e.period] = (monthlyEarnings[e.period] || 0) + e.amount
      monthlyStreams[e.period] = (monthlyStreams[e.period] || 0) + e.streams
    }

    const earningsByMonth = Object.entries(monthlyEarnings)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([period, amount]) => ({
        period,
        amount: Math.round(amount * 100) / 100,
        streams: monthlyStreams[period] || 0,
      }))

    // Aggregate by platform
    const platformStats = platforms.map((p) => {
      const totalStreams = p.statuses.reduce((sum, s) => sum + s.streams, 0)
      return {
        id: p.id,
        name: p.name,
        icon: p.icon,
        color: p.color,
        streams: totalStreams,
        releases: p.statuses.length,
      }
    }).sort((a, b) => b.streams - a.streams)

    // Top releases
    const topReleases = releases.slice(0, 6).map((r) => {
      const totalStreams = r.platformStatuses.reduce((sum, s) => sum + s.streams, 0)
      const totalEarnings = r.earnings.reduce((sum, e) => sum + e.amount, 0)
      return {
        id: r.id,
        title: r.title,
        artist: r.artist.name,
        type: r.type,
        status: r.status,
        totalStreams,
        totalEarnings: Math.round(totalEarnings * 100) / 100,
        platforms: r.platformStatuses.filter((s) => s.status === 'live').length,
        releaseDate: r.releaseDate,
      }
    })

    const totalEarnings = allEarnings.reduce((sum, e) => sum + e.amount, 0)
    const totalStreams = allEarnings.reduce((sum, e) => sum + e.streams, 0)
    const totalArtists = artists.length
    const totalReleases = releases.length

    return NextResponse.json({
      totalEarnings: Math.round(totalEarnings * 100) / 100,
      totalStreams,
      totalArtists,
      totalReleases,
      earningsByMonth,
      platformStats,
      topReleases,
      artists: artists.map((a) => ({
        id: a.id,
        name: a.name,
        genre: a.genre,
        monthlyListeners: a.monthlyListeners,
        totalStreams: a.totalStreams,
        releaseCount: a.releases.length,
      })),
    })
  } catch (error) {
    console.error('Dashboard API error:', error)
    return NextResponse.json({ error: 'Failed to load dashboard data' }, { status: 500 })
  }
}
