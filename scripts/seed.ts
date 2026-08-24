import { db } from '../src/lib/db'

async function seed() {
  const platforms = [
    { id: 'spotify', name: 'Spotify', icon: '🎵', color: '#1DB954' },
    { id: 'apple-music', name: 'Apple Music', icon: '🍎', color: '#FC3C44' },
    { id: 'amazon-music', name: 'Amazon Music', icon: '🎶', color: '#25D1DA' },
    { id: 'youtube-music', name: 'YouTube Music', icon: '▶️', color: '#FF0000' },
    { id: 'tidal', name: 'Tidal', icon: '🌊', color: '#000000' },
    { id: 'deezer', name: 'Deezer', icon: '🎙️', color: '#A238FF' },
    { id: 'tiktok', name: 'TikTok / Resso', icon: '📱', color: '#00F2EA' },
    { id: 'soundcloud', name: 'SoundCloud', icon: '☁️', color: '#FF5500' },
  ]

  for (const p of platforms) {
    await db.platform.upsert({
      where: { id: p.id },
      update: {},
      create: p,
    })
  }

  const artists = [
    { id: 'artist-1', name: 'Luna Waves', genre: 'Electronic / Dream Pop', monthlyListeners: 284000, totalStreams: 12800000, avatarUrl: '' },
    { id: 'artist-2', name: 'Marcus Cole', genre: 'Hip-Hop / R&B', monthlyListeners: 512000, totalStreams: 34500000, avatarUrl: '' },
    { id: 'artist-3', name: 'The Velvet Hours', genre: 'Indie Rock', monthlyListeners: 178000, totalStreams: 8200000, avatarUrl: '' },
    { id: 'artist-4', name: 'Aria Moon', genre: 'Pop / Alt Pop', monthlyListeners: 1450000, totalStreams: 98700000, avatarUrl: '' },
    { id: 'artist-5', name: 'DJ Phantom', genre: 'House / Techno', monthlyListeners: 89000, totalStreams: 4300000, avatarUrl: '' },
  ]

  for (const a of artists) {
    const user = await db.user.upsert({
      where: { email: `${a.id}@demo.subelodistro.com` },
      update: {},
      create: { email: `${a.id}@demo.subelodistro.com` },
    })
    await db.artist.upsert({
      where: { id: a.id },
      update: {},
      create: { ...a, userId: user.id },
    })
  }

  const releases = [
    { id: 'rel-1', title: 'Neon Dreams', artistId: 'artist-1', type: 'Album', status: 'live', releaseDate: new Date('2025-03-15') },
    { id: 'rel-2', title: 'Midnight Drive', artistId: 'artist-1', type: 'Single', status: 'live', releaseDate: new Date('2025-06-01') },
    { id: 'rel-3', title: 'Golden Hour', artistId: 'artist-2', type: 'Album', status: 'live', releaseDate: new Date('2024-11-20') },
    { id: 'rel-4', title: 'City Lights', artistId: 'artist-2', type: 'EP', status: 'live', releaseDate: new Date('2025-05-10') },
    { id: 'rel-5', title: 'Rust & Ruin', artistId: 'artist-3', type: 'Album', status: 'live', releaseDate: new Date('2025-01-28') },
    { id: 'rel-6', title: 'Echoes', artistId: 'artist-4', type: 'Single', status: 'live', releaseDate: new Date('2025-07-04') },
    { id: 'rel-7', title: 'Starfall', artistId: 'artist-4', type: 'Album', status: 'live', releaseDate: new Date('2025-04-12') },
    { id: 'rel-8', title: 'Deep State', artistId: 'artist-5', type: 'EP', status: 'live', releaseDate: new Date('2025-02-14') },
    { id: 'rel-9', title: 'Pulse', artistId: 'artist-5', type: 'Single', status: 'review', releaseDate: new Date('2025-07-25') },
    { id: 'rel-10', title: 'Velvet Skies', artistId: 'artist-3', type: 'Single', status: 'live', releaseDate: new Date('2025-06-18') },
  ]

  for (const r of releases) {
    await db.release.upsert({
      where: { id: r.id },
      update: {},
      create: r,
    })
  }

  const statuses = ['live', 'live', 'live', 'live', 'live', 'live', 'live', 'live']
  for (const release of releases) {
    for (let i = 0; i < platforms.length; i++) {
      const streams = Math.floor(Math.random() * 500000) + 10000
      await db.platformStatus.create({
        data: {
          releaseId: release.id,
          platformId: platforms[i].id,
          status: release.status === 'review' ? 'pending' : statuses[Math.floor(Math.random() * statuses.length)],
          streams,
        },
      })
    }
  }

  const months = ['2025-01', '2025-02', '2025-03', '2025-04', '2025-05', '2025-06', '2025-07']
  for (const release of releases) {
    for (const month of months) {
      const monthDate = new Date(month + '-15')
      if (monthDate < release.releaseDate) continue
      const streams = Math.floor(Math.random() * 200000) + 5000
      const amount = parseFloat((streams * 0.004).toFixed(2))
      await db.earning.create({
        data: {
          releaseId: release.id,
          platformId: platforms[Math.floor(Math.random() * platforms.length)].id,
          amount,
          currency: 'USD',
          period: month,
          streams,
        },
      })
    }
  }

  console.log('Seed data created successfully!')
}

seed()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })
