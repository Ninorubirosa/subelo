'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

const faqs = [
  {
    q: 'How fast does my music go live?',
    a: 'Most releases are live on all major platforms within 24-48 hours. Spotify and Apple Music typically approve within 24 hours. We pre-validate all your metadata and audio quality before submission, which eliminates the #1 cause of delays. If you choose a specific release date more than 2 weeks out, we schedule delivery to ensure your music is live exactly on that date.',
  },
  {
    q: 'Do you really take 0% commission?',
    a: 'Yes, really. We monetize through subscriptions, not through your royalties. You keep every cent you earn from streaming. There are no hidden fees, no percentage takes, and no "processing charges." The price you see on the pricing page is the only thing you pay us. Your royalties are 100% yours, always.',
  },
  {
    q: 'What happens if I want to leave?',
    a: 'Your music stays live on all platforms. We never charge a takedown fee (unlike some competitors who charge $25+). If you cancel your subscription, your existing releases remain distributed. You can also request a full takedown at any time, free of charge. We believe you should own your music and your freedom.',
  },
  {
    q: 'How do split payments work?',
    a: 'You can add unlimited collaborators to any release and set percentage-based splits. For example: 60% to you, 25% to your producer, 15% to a featured artist. When royalties come in, we calculate each person\'s share and pay them directly. No more awkward Venmo requests or chasing people down for their cut.',
  },
  {
    q: 'What formats do you accept?',
    a: 'We accept WAV (16-bit or 24-bit, 44.1kHz or 48kHz), FLAC, and AIFF. We recommend 16-bit/44.1kHz WAV for the best balance of quality and compatibility across all platforms. Cover art must be at least 3000x3000px in JPG or PNG format, in RGB color space.',
  },
  {
    q: 'Do you offer publishing administration?',
    a: 'Yes! Publishing administration is included in the Pro and Label plans. We register your compositions with collection societies worldwide (ASCAP, BMI, PRS, GEMA, JASRAC, and 80+ more) and collect mechanical and performance royalties that streaming alone does not capture. This typically increases your total income by 15-30%.',
  },
]

export function FAQ() {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <section className="relative py-24 sm:py-32">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-lime text-sm font-semibold tracking-widest uppercase mb-3">
            FAQ
          </p>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
            Got Questions?
          </h2>
        </motion.div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full glass-card rounded-xl p-5 text-left hover:border-lime/30 transition-colors"
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="font-semibold text-sm sm:text-base">{faq.q}</span>
                  <motion.div
                    animate={{ rotate: open === i ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <ChevronDown className="w-5 h-5 text-muted-foreground shrink-0" />
                  </motion.div>
                </div>

                <AnimatePresence>
                  {open === i && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}