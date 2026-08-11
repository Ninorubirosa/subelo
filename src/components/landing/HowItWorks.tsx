'use client'

import { motion } from 'framer-motion'
import { Upload, Globe, Wallet } from 'lucide-react'

const steps = [
  {
    number: '01',
    icon: Upload,
    title: 'Upload Your Music',
    description:
      'Drag and drop your tracks, add your artwork, enter your metadata. Run it through our built-in AI mastering before you ship, or upload a file that\'s already mastered. Supports WAV, FLAC, and high-res audio up to 48kHz/24bit.',
  },
  {
    number: '02',
    icon: Globe,
    title: 'Pick Your Platforms',
    description:
      'Select from 220+ stores and streaming services. Spotify, Apple Music, TikTok, Amazon, YouTube Music, Deezer, Tidal, and dozens more. One click sends your music everywhere. Pre-save links included for every release.',
  },
  {
    number: '03',
    icon: Wallet,
    title: 'Get Paid Fast',
    description:
      'Watch your streams and earnings in real-time on your dashboard. Payouts are fast and automated — no waiting on manual processing. Split payments with collaborators automatically. No minimum payout threshold.',
  },
]

export function HowItWorks() {
  return (
    <section className="relative py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-lime text-sm font-semibold tracking-widest uppercase mb-3">How It Works</p>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
            Three Steps. That&apos;s It.
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
          {steps.map((step, i) => {
            const Icon = step.icon
            return (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="relative group"
              >
                <div className="glass-card rounded-2xl p-6 lg:p-8 h-full hover:border-lime/30 transition-colors duration-300">
                  {/* Step number */}
                  <div className="text-6xl font-black text-lime/10 absolute top-4 right-6">
                    {step.number}
                  </div>

                  <div className="relative z-10">
                    <div className="w-12 h-12 rounded-xl bg-lime/10 flex items-center justify-center mb-6 group-hover:bg-lime/20 transition-colors">
                      <Icon className="w-6 h-6 text-lime" />
                    </div>
                    <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                    <p className="text-muted-foreground leading-relaxed text-sm">
                      {step.description}
                    </p>
                  </div>
                </div>

                {/* Connector line (desktop only) */}
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 lg:-right-5 w-8 lg:w-10 h-px bg-gradient-to-r from-lime/40 to-transparent" />
                )}
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}