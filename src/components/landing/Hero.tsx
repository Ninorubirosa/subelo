'use client'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { motion } from 'framer-motion'
import { Play, ArrowRight, Upload } from 'lucide-react'

function WaveformVisual() {
  const bars = 48
  return (
    <div className="flex items-end justify-center gap-[2px] h-24 sm:h-32 opacity-60">
      {Array.from({ length: bars }).map((_, i) => {
        const delay = i * 0.08
        const maxH = 30 + Math.sin(i * 0.5) * 40 + Math.random() * 20
        return (
          <motion.div
            key={i}
            className="w-[3px] rounded-full bg-lime"
            initial={{ height: '20%' }}
            animate={{
              height: ['20%', `${maxH}%`, '20%'],
            }}
            transition={{
              duration: 1.2 + Math.random() * 0.8,
              repeat: Infinity,
              delay,
              ease: 'easeInOut',
            }}
          />
        )
      })}
    </div>
  )
}

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
      {/* Background effects */}
      <div className="absolute inset-0 grid-bg" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-lime/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-lime/4 rounded-full blur-[140px]" />

      {/* Ambient brand footage — the clip's native steel-blue tone already sits inside the logo's blue hue range, so it only needs a saturation lift, not a forced duotone */}
      <div
        className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 w-[42%] max-w-xl aspect-[3/4] rounded-l-[3rem] overflow-hidden"
        style={{ maskImage: 'linear-gradient(to left, black 45%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to left, black 45%, transparent 100%)' }}
      >
        <video
          className="w-full h-full object-cover opacity-60"
          style={{ filter: 'saturate(2.2) contrast(1.1) brightness(0.95)' }}
          src="/hero-loop.mp4"
          autoPlay
          muted
          loop
          playsInline
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Badge variant="outline" className="border-lime/30 text-lime mb-6 px-4 py-1.5 text-sm">
            <Play className="w-3 h-3 mr-1.5" />
            Now distributing to 150+ platforms worldwide
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

        {/* Waveform */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.5 }}
          className="mt-12 w-full max-w-3xl"
        >
          <WaveformVisual />
        </motion.div>

        {/* Floating Stats */}
        <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 w-full max-w-3xl">
          <FloatingStat value="$2.4B+" label="Paid to Artists" delay={0.6} />
          <FloatingStat value="500K+" label="Artists Trust Us" delay={0.7} />
          <FloatingStat value="150+" label="Store Partners" delay={0.8} />
          <FloatingStat value="3 Days" label="Avg. Payout Speed" delay={0.9} />
        </div>
      </div>
    </section>
  )
}