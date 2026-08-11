'use client'

import { motion } from 'framer-motion'

export function VideoShowcase() {
  return (
    <section className="relative py-24 sm:py-32">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="text-lime text-sm font-semibold tracking-widest uppercase mb-3">See It In Action</p>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
            Watch Subelo In Action.
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
          className="glow-border rounded-2xl overflow-hidden aspect-video"
        >
          <video
            className="w-full h-full object-cover"
            style={{ filter: 'saturate(2.2) contrast(1.1) brightness(0.95)' }}
            src="/hero-loop.mp4"
            autoPlay
            muted
            loop
            playsInline
          />
        </motion.div>
      </div>
    </section>
  )
}
