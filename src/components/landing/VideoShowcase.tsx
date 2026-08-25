'use client'

import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Pause, Play } from 'lucide-react'
import { useFadeInUp } from '@/lib/motion'

export function VideoShowcase() {
  const fadeHeader = useFadeInUp(20)
  const fadeVideo = useFadeInUp(30)
  const videoRef = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(true)

  function togglePlayback() {
    const video = videoRef.current
    if (!video) return
    if (video.paused) {
      video.play()
      setPlaying(true)
    } else {
      video.pause()
      setPlaying(false)
    }
  }

  return (
    <section className="relative py-24 sm:py-32">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="shown"
          variants={fadeHeader}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
            Watch Subelo In Action.
          </h2>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="shown"
          variants={fadeVideo}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
          className="relative glow-border rounded-2xl overflow-hidden aspect-video group"
        >
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            style={{ filter: 'saturate(2.2) contrast(1.1) brightness(0.95)' }}
            src="/hero-loop.mp4"
            autoPlay
            muted
            loop
            playsInline
          />
          <button
            type="button"
            onClick={togglePlayback}
            aria-label={playing ? 'Pause video' : 'Play video'}
            className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-black/60 backdrop-blur-sm border border-white/10 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-opacity"
          >
            {playing ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
        </motion.div>
      </div>
    </section>
  )
}
