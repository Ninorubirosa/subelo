'use client'

import { motion } from 'framer-motion'
import { Check, X, Minus } from 'lucide-react'

const comparisons = [
  {
    feature: 'Royalty Split',
    reson: '100% Yours',
    distrokid: '100% (with catches)',
    tunecore: '100%',
    resonHighlight: true,
  },
  {
    feature: 'Starting Price',
    reson: '$4.99/mo',
    distrokid: '$22.99/yr',
    tunecore: '$9.99/single',
    resonHighlight: true,
  },
  {
    feature: 'Payout Speed',
    reson: 'Fast & Automated',
    distrokid: '1-2 Weeks',
    tunecore: '2-4 Weeks',
    resonHighlight: true,
  },
  {
    feature: 'Release Limit',
    reson: 'Unlimited',
    distrokid: 'Unlimited (extra $)',
    tunecore: 'Per-release fee',
    resonHighlight: true,
  },
  {
    feature: 'Real-Time Analytics',
    reson: true,
    distrokid: false,
    tunecore: 'Basic',
    resonHighlight: true,
  },
  {
    feature: 'AI Mastering',
    reson: 'Included',
    distrokid: false,
    tunecore: false,
    resonHighlight: true,
  },
  {
    feature: 'Split Payments',
    reson: true,
    distrokid: true,
    tunecore: false,
    resonHighlight: false,
  },
  {
    feature: 'Custom Release Date',
    reson: true,
    distrokid: true,
    tunecore: true,
    resonHighlight: false,
  },
  {
    feature: 'Store Removal Fee',
    reson: 'Free',
    distrokid: 'Free (leave)',
    tunecore: '$25 fee',
    resonHighlight: true,
  },
]

function CellValue({ value, isHighlight }: { value: string | boolean; isHighlight?: boolean }) {
  if (typeof value === 'boolean') {
    return value ? (
      <Check className="w-5 h-5 text-lime mx-auto" />
    ) : (
      <X className="w-5 h-5 text-red-400 mx-auto" />
    )
  }
  return (
    <span className={isHighlight ? 'text-lime font-semibold' : 'text-foreground'}>
      {value}
    </span>
  )
}

export function Comparison() {
  return (
    <section id="comparison" className="relative py-24 sm:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
            Why Settle for <span className="text-muted-foreground line-through">Less</span>?
          </h2>
          <p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto">
            We compared every feature that actually matters. Here&apos;s how we stack up
            against the two biggest names in the game.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0"
        >
          <table className="w-full min-w-[640px]">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-4 px-3 text-sm text-muted-foreground font-medium">Feature</th>
                <th className="py-4 px-3 text-center">
                  <div className="inline-flex items-center gap-2 bg-lime/10 text-lime px-4 py-2 rounded-full text-sm font-bold">
                    SUBELO
                  </div>
                </th>
                <th className="py-4 px-3 text-center text-sm text-muted-foreground font-medium">
                  DistroKid
                </th>
                <th className="py-4 px-3 text-center text-sm text-muted-foreground font-medium">
                  TuneCore
                </th>
              </tr>
            </thead>
            <tbody>
              {comparisons.map((row, i) => (
                <tr
                  key={i}
                  className="border-b border-border/50 hover:bg-surface-light/50 transition-colors"
                >
                  <td className="py-4 px-3 text-sm font-medium">{row.feature}</td>
                  <td className="py-4 px-3 text-center text-sm">
                    <CellValue value={row.reson} isHighlight={row.resonHighlight} />
                  </td>
                  <td className="py-4 px-3 text-center text-sm">
                    <CellValue value={row.distrokid} />
                  </td>
                  <td className="py-4 px-3 text-center text-sm">
                    <CellValue value={row.tunecore} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </div>
    </section>
  )
}