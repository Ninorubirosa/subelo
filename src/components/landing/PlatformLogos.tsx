'use client'

import { motion } from 'framer-motion'

const platforms = [
  'Spotify',
  'Apple Music',
  'Amazon Music',
  'YouTube Music',
  'Tidal',
  'Deezer',
  'TikTok',
  'Pandora',
  'iHeartRadio',
  'SoundCloud',
  'Boomplay',
  'Anghami',
]

export function PlatformLogos() {
  return (
    <section className="py-16 border-y border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center text-sm text-muted-foreground mb-8"
        >
          Distribute to 220+ stores and streaming platforms
        </motion.p>
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
          {platforms.map((name, i) => (
            <motion.div
              key={name}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="text-muted-foreground/60 hover:text-foreground transition-colors font-medium text-sm sm:text-base whitespace-nowrap"
            >
              {name}
            </motion.div>
          ))}
          <span className="text-lime font-semibold text-sm">+138 more</span>
        </div>
      </div>
    </section>
  )
}