'use client'

import { motion } from 'framer-motion'
import {
  BarChart3,
  Shield,
  Zap,
  Users,
  Globe2,
  Sparkles,
} from 'lucide-react'

const features = [
  {
    icon: Zap,
    title: 'Lightning-Fast Distribution',
    description:
      'Your music goes live on Spotify, Apple Music, and 220+ stores within 24-48 hours. We pre-validate your metadata and audio quality before submission, which eliminates the most common cause of delivery delays.',
  },
  {
    icon: BarChart3,
    title: 'Real-Time Analytics',
    description:
      'Stop waiting weeks for data. Our dashboard updates in real-time so you can see streams, revenue, listener demographics, and geographic data the moment they happen. Make data-driven decisions about your next release, tour, or marketing push.',
  },
  {
    icon: Shield,
    title: 'Keep 100% of Royalties',
    description:
      'No commission. No surprises. No "additional service fees" buried in the fine print. What you earn is what you get. We make money from subscriptions, not from taking a cut of your hard-earned royalties. That is the way it should be.',
  },
  {
    icon: Users,
    title: 'Unlimited Split Payments',
    description:
      'Collaborating with producers, featured artists, or bandmates? Set up percentage-based splits with unlimited collaborators per release. Payments are automated and transparent — everyone gets paid directly, no chasing people down.',
  },
  {
    icon: Globe2,
    title: '220+ Global Platforms',
    description:
      'Spotify, Apple Music, Amazon Music, YouTube Music, Tidal, Deezer, TikTok, Pandora, iHeartRadio, Boomplay, and over 200 more. We are constantly adding new platforms to ensure your music reaches every corner of the global market.',
  },
  {
    icon: Sparkles,
    title: 'AI-Powered Mastering',
    description:
      'Every upload can run through our built-in AI mastering engine before it ships to DSPs — a consistent, radio-ready loudness and tone pass with no extra software or engineer needed. You can always upload your own pre-mastered file instead.',
  },
]

export function Features() {
  return (
    <section id="features" className="relative py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-lime text-sm font-semibold tracking-widest uppercase mb-3">
            Features
          </p>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
            Built Different.
          </h2>
          <p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto">
            Every feature designed from the ground up to put artists first. No bloated legacy systems, no corpo overhead.
          </p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => {
            const Icon = f.icon
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="glass-card rounded-2xl p-6 hover:border-lime/30 transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-xl bg-lime/10 flex items-center justify-center mb-4 group-hover:bg-lime/20 transition-colors">
                  <Icon className="w-6 h-6 text-lime" />
                </div>
                <h3 className="text-lg font-bold mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.description}</p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
