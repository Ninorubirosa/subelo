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
import { cn } from '@/lib/utils'
import { useFadeInUp } from '@/lib/motion'

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
  const fade = useFadeInUp(20)
  return (
    <section id="features" className="relative py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="shown"
          variants={fade}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
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
            const featured = i === 0
            return (
              <motion.div
                key={f.title}
                initial="hidden"
                whileInView="shown"
                variants={fade}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className={cn(
                  'glass-card rounded-2xl p-6 hover:border-lime/30 transition-colors duration-300 group',
                  featured && 'sm:col-span-2 lg:col-span-2 p-8 flex flex-col justify-center'
                )}
              >
                <div
                  className={cn(
                    'w-12 h-12 rounded-xl bg-lime/10 flex items-center justify-center mb-4 group-hover:bg-lime/20 transition-colors',
                    featured && 'w-16 h-16 rounded-2xl mb-6'
                  )}
                >
                  <Icon className={cn('w-6 h-6 text-lime', featured && 'w-8 h-8')} />
                </div>
                <h3 className={cn('text-lg font-bold mb-2', featured && 'text-2xl sm:text-3xl mb-3')}>
                  {f.title}
                </h3>
                <p className={cn('text-sm text-muted-foreground leading-relaxed', featured && 'text-base max-w-md')}>
                  {f.description}
                </p>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
