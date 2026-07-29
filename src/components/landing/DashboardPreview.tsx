'use client'

import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts'
import { TrendingUp, DollarSign, Music, Users, ArrowUpRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

interface DashboardData {
  totalEarnings: number
  totalStreams: number
  totalArtists: number
  totalReleases: number
  earningsByMonth: { period: string; amount: number; streams: number }[]
  platformStats: { id: string; name: string; icon: string; color: string; streams: number; releases: number }[]
  topReleases: {
    id: string
    title: string
    artist: string
    type: string
    status: string
    totalStreams: number
    totalEarnings: number
    platforms: number
  }[]
}

function formatNumber(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
  return Math.round(n).toString()
}

function formatCurrency(n: number): string {
  if (!n || isNaN(n)) return '$0.00'
  const fixed = Math.floor(n * 100) / 100
  const str = fixed.toFixed(2)
  const [intPart, decPart] = str.split('.')
  const formatted = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return '$' + formatted + '.' + decPart
}

class CustomTooltip extends React.Component<any, any> {
  render() {
    const { active, payload, label } = this.props
    if (!active || !payload?.length) return null
    return (
      <div className="glass-card rounded-lg p-3 text-sm">
        <p className="text-muted-foreground mb-1">{label}</p>
        {payload.map((entry: any, i: number) => (
          <p key={i} style={{ color: entry.color }} className="font-semibold">
            {entry.name === 'amount' ? formatCurrency(entry.value) : formatNumber(entry.value)}{' '}
            {entry.name === 'amount' ? '' : 'streams'}
          </p>
        ))}
      </div>
    )
  }
}

const mockPlatformData = [
  { name: 'Spotify', streams: 4200000, color: '#1DB954' },
  { name: 'Apple Music', streams: 2800000, color: '#FC3C44' },
  { name: 'YouTube', streams: 1900000, color: '#FF0000' },
  { name: 'Amazon', streams: 850000, color: '#25D1DA' },
  { name: 'TikTok', streams: 1200000, color: '#00F2EA' },
  { name: 'Others', streams: 640000, color: '#A238FF' },
]

const mockEarningsData = [
  { period: 'Jan', amount: 3200, streams: 780000 },
  { period: 'Feb', amount: 4100, streams: 1025000 },
  { period: 'Mar', amount: 5800, streams: 1450000 },
  { period: 'Apr', amount: 7200, streams: 1800000 },
  { period: 'May', amount: 6800, streams: 1700000 },
  { period: 'Jun', amount: 8900, streams: 2225000 },
  { period: 'Jul', amount: 11200, streams: 2800000 },
]

const mockReleases = [
  { title: 'Echoes', artist: 'Aria Moon', type: 'Single', streams: 4200000, earnings: 16800, status: 'live' },
  { title: 'Golden Hour', artist: 'Marcus Cole', type: 'Album', streams: 3100000, earnings: 12400, status: 'live' },
  { title: 'Starfall', artist: 'Aria Moon', type: 'Album', streams: 2800000, earnings: 11200, status: 'live' },
  { title: 'Neon Dreams', artist: 'Luna Waves', type: 'Album', streams: 1900000, earnings: 7600, status: 'live' },
  { title: 'City Lights', artist: 'Marcus Cole', type: 'EP', streams: 1200000, earnings: 4800, status: 'live' },
]

export function DashboardPreview() {
  const [data, setData] = useState<DashboardData | null>(null)

  useEffect(() => {
    fetch('/api/dashboard')
      .then((r) => r.json())
      .then(setData)
      .catch(() => {
        // fallback to mock data
      })
  }, [])

  const earnings = data?.earningsByMonth?.length ? data.earningsByMonth.map((e) => ({
    period: e.period.split('-')[1] ? ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][parseInt(e.period.split('-')[1]) - 1] : e.period,
    amount: e.amount,
    streams: e.streams,
  })) : mockEarningsData

  const platforms = data?.platformStats?.length
    ? data.platformStats.slice(0, 6).map((p) => ({ name: p.name, streams: p.streams, color: p.color }))
    : mockPlatformData

  const releases = data?.topReleases?.length ? data.topReleases.slice(0, 5) : mockReleases

  const totalEarnings = data?.totalEarnings || earnings.reduce((s, e) => s + e.amount, 0)
  const totalStreams = data?.totalStreams || platforms.reduce((s, p) => s + p.streams, 0)

  return (
    <section id="dashboard" className="relative py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-lime text-sm font-semibold tracking-widest uppercase mb-3">Live Dashboard</p>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
            Your Music. In Real Time.
          </h2>
          <p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto">
            Watch every stream, every penny, from every platform — updated in real-time.
          </p>
        </motion.div>

        {/* Stats Row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { icon: DollarSign, label: 'Total Earnings', value: formatCurrency(totalEarnings), change: '+23.4%' },
            { icon: TrendingUp, label: 'Total Streams', value: formatNumber(totalStreams), change: '+18.7%' },
            { icon: Music, label: 'Active Releases', value: String(data?.totalReleases || 47), change: '+12' },
            { icon: Users, label: 'Monthly Listeners', value: formatNumber(data?.totalStreams ? data.totalStreams / 50 : 284000), change: '+8.2%' },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="bg-surface border-border hover:border-lime/20 transition-colors">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between mb-2">
                    <stat.icon className="w-4 h-4 text-muted-foreground" />
                    <span className="text-xs text-lime font-medium flex items-center gap-0.5">
                      <ArrowUpRight className="w-3 h-3" /> {stat.change}
                    </span>
                  </div>
                  <div className="text-2xl sm:text-3xl font-bold">{stat.value}</div>
                  <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid lg:grid-cols-5 gap-4 mb-8">
          {/* Earnings Chart */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="lg:col-span-3"
          >
            <Card className="bg-surface border-border">
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="font-bold">Earnings Over Time</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Monthly royalty breakdown</p>
                  </div>
                </div>
                <div className="h-64 sm:h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={earnings}>
                      <defs>
                        <linearGradient id="earnGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#CCFF00" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#CCFF00" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="period" axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 12 }} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#71717a', fontSize: 12 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="amount" stroke="#CCFF00" strokeWidth={2} fill="url(#earnGrad)" name="amount" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Platform Breakdown */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2"
          >
            <Card className="bg-surface border-border h-full">
              <CardContent className="p-4 sm:p-6">
                <h3 className="font-bold mb-1">Streams by Platform</h3>
                <p className="text-xs text-muted-foreground mb-6">Last 30 days</p>
                <div className="space-y-3">
                  {platforms.map((p) => {
                    const maxStreams = Math.max(...platforms.map((x) => x.streams))
                    const pct = (p.streams / maxStreams) * 100
                    return (
                      <div key={p.name}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">{p.name}</span>
                          <span className="text-xs text-muted-foreground">{formatNumber(p.streams)}</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: `${pct}%` }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, ease: 'easeOut' }}
                            className="h-full rounded-full"
                            style={{ backgroundColor: p.color }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Top Releases Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <Card className="bg-surface border-border overflow-hidden">
            <CardContent className="p-4 sm:p-6">
              <h3 className="font-bold mb-1">Top Performing Releases</h3>
              <p className="text-xs text-muted-foreground mb-6">All-time performance</p>
              <div className="overflow-x-auto -mx-4 sm:mx-0">
                <table className="w-full min-w-[500px]">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-3 text-xs font-medium text-muted-foreground">Release</th>
                      <th className="text-left py-3 px-3 text-xs font-medium text-muted-foreground">Artist</th>
                      <th className="text-left py-3 px-3 text-xs font-medium text-muted-foreground hidden sm:table-cell">Type</th>
                      <th className="text-right py-3 px-3 text-xs font-medium text-muted-foreground">Streams</th>
                      <th className="text-right py-3 px-3 text-xs font-medium text-muted-foreground">Earnings</th>
                    </tr>
                  </thead>
                  <tbody>
                    {releases.map((r: any) => (
                      <tr key={r.id || r.title} className="border-b border-border/50 hover:bg-surface-light/50 transition-colors">
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-gradient-to-br from-lime/20 to-lime/5 flex items-center justify-center text-xs text-lime font-bold">
                              {r.title.charAt(0)}
                            </div>
                            <span className="font-medium text-sm">{r.title}</span>
                          </div>
                        </td>
                        <td className="py-3 px-3 text-sm text-muted-foreground">{r.artist}</td>
                        <td className="py-3 px-3 text-sm text-muted-foreground hidden sm:table-cell">
                          <span className="bg-surface-light px-2 py-0.5 rounded text-xs">{r.type}</span>
                        </td>
                        <td className="py-3 px-3 text-sm text-right font-mono">{formatNumber(r.totalStreams || r.streams)}</td>
                        <td className="py-3 px-3 text-sm text-right font-mono text-lime">
                          {formatCurrency(r.totalEarnings || r.earnings)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}
