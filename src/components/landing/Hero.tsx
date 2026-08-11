'use client'

import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'
import { Play, ArrowRight, Upload } from 'lucide-react'

const WaveformScene = dynamic(() => import('./WaveformScene').then((m) => m.WaveformScene), {
  ssr: false,
  loading: () => <div className="w-full h-full bg-gradient-to-b from-lime/10 via-background to-background" />,
})

function FloatingStat({ value, label, delay }: { value: string; label: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6 }}
      className="glass-card rounded-2xl p-4 sm:p-6 text-center"
    >
      <div className="text-2xl sm:text-3xl font-bold text-lime">{value}</div>
      <div className="text-xs sm:text-sm text-muted-foreground mt-1">{label}</div>
    </motion.div>
  )
}

export function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-16 overflow-hidden">
      {/* Full-bleed generative waveform scene */}
      <div className="absolute inset-0">
        <WaveformScene />
      </div>
      {/* Scrim for text legibility over the 3D scene */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_75%_55%_at_50%_45%,var(--background)_0%,color-mix(in_oklch,var(--background)_55%,transparent)_45%,transparent_70%)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-transparent to-background" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Badge variant="outline" className="border-lime/30 text-lime mb-6 px-4 py-1.5 text-sm">
            <Play className="w-3 h-3 mr-1.5" />
            Now distributing to 220+ platforms worldwide
          </Badge>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-4xl sm:text-6xl lg:text-8xl font-black tracking-tight leading-[0.95]"
        >
          Your Music.
          <br />
          <span className="text-lime">Your Rules.</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl leading-relaxed"
        >
          Distribute to every major platform. Keep 100% of your royalties.
          Get paid in days, not months. No tricks, no hidden fees, no BS.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-8 flex flex-col sm:flex-row gap-3 w-full sm:w-auto"
        >
          <Button
            size="lg"
            className="bg-lime text-black hover:bg-lime-dark font-bold text-base px-8 py-6 glow-button w-full sm:w-auto"
          >
            <Upload className="w-5 h-5 mr-2" />
            Upload Your First Track
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-border hover:border-lime/50 hover:text-lime text-base px-8 py-6 w-full sm:w-auto"
          >
            See How It Works
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </motion.div>

        {/* Floating Stats */}
        <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 w-full max-w-3xl">
          <FloatingStat value="100+" label="Founding Artists" delay={0.6} />
          <FloatingStat value="100%" label="Royalties Kept" delay={0.7} />
          <FloatingStat value="220+" label="Store Partners" delay={0.8} />
          <FloatingStat value="48 Hrs" label="Avg. Time to Go Live" delay={0.9} />
        </div>
      </div>
    </section>
  )
}