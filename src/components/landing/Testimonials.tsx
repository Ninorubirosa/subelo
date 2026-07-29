'use client'

import { motion } from 'framer-motion'
import { Star } from 'lucide-react'

const testimonials = [
  {
    name: 'Aria Moon',
    role: 'Indie Pop Artist',
    quote:
      'I switched from DistroKid after realizing how much I was paying for add-ons that Resonate includes for free. Content ID, publishing admin, split payments — all included. My royalties literally doubled overnight because I stopped paying for "extras."',
    avatar: 'AM',
    streams: '98.7M',
  },
  {
    name: 'Marcus Cole',
    role: 'Hip-Hop Producer & Artist',
    quote:
      'The real-time analytics changed how I release music. I can see which cities are streaming my tracks the most within hours of dropping. Last month I booked a tour entirely based on Resonate data. No other platform gives you that kind of insight.',
    avatar: 'MC',
    streams: '34.5M',
  },
  {
    name: 'Luna Waves',
    role: 'Electronic / Dream Pop',
    quote:
      'TuneCore took 3 weeks to get my music on Spotify. Resonate had it live in 36 hours. The difference in speed meant I caught a playlist curator window that would have been closed otherwise. That playlist alone generated 200K streams in the first week.',
    avatar: 'LW',
    streams: '12.8M',
  },
]

export function Testimonials() {
  return (
    <section id="testimonials" className="relative py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-lime text-sm font-semibold tracking-widest uppercase mb-3">
            Artist Stories
          </p>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
            Trusted by 500K+ Artists.
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card rounded-2xl p-6"
            >
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: 5 }).map((_, j) => (
                  <Star key={j} className="w-4 h-4 fill-lime text-lime" />
                ))}
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed mb-6">&ldquo;{t.quote}&rdquo;</p>

              <div className="flex items-center gap-3 pt-4 border-t border-border">
                <div className="w-10 h-10 rounded-full bg-lime/10 flex items-center justify-center text-sm font-bold text-lime">
                  {t.avatar}
                </div>
                <div>
                  <div className="font-semibold text-sm">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
                <div className="ml-auto text-right">
                  <div className="text-xs text-muted-foreground">Lifetime Streams</div>
                  <div className="text-sm font-bold text-lime">{t.streams}</div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
