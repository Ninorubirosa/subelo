'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Check } from 'lucide-react'

const plans = [
  {
    name: 'Starter',
    monthlyPrice: 4.99,
    yearlyPrice: 39.99,
    description: 'Perfect for new artists just getting started.',
    features: [
      'Unlimited releases',
      '220+ platforms',
      '100% royalties',
      'Real-time analytics',
      'AI mastering',
      'Spotify for Artists pre-save',
      'Fast, automated payouts',
      'Basic support',
    ],
    cta: 'Start Free Trial',
    popular: false,
  },
  {
    name: 'Pro',
    monthlyPrice: 9.99,
    yearlyPrice: 79.99,
    description: 'For serious artists building a career.',
    features: [
      'Everything in Starter',
      'Smart Links & fan data tools',
      'Split payments (unlimited)',
      'Priority review (24hr)',
      'Advanced analytics & reports',
      'Custom label pages',
      'Pre-save campaigns',
      'TikTok Sound distribution',
      'Dedicated support',
    ],
    cta: 'Go Pro',
    popular: true,
  },
  {
    name: 'Label',
    monthlyPrice: 29.99,
    yearlyPrice: 239.99,
    description: 'For labels and artist managers.',
    features: [
      'Everything in Pro',
      'Unlimited sub-accounts',
      'Label analytics dashboard',
      'Bulk upload & scheduling',
      'API access',
      'Custom royalty splits',
      'White-label reports',
      'Account manager',
      'Promotional tools',
      'Early access to features',
    ],
    cta: 'Contact Sales',
    popular: false,
  },
]

export function Pricing() {
  const [yearly, setYearly] = useState(false)

  return (
    <section id="pricing" className="relative py-24 sm:py-32">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-lime/3 rounded-full blur-[150px] pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <p className="text-lime text-sm font-semibold tracking-widest uppercase mb-3">Pricing</p>
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
            Simple, Honest Pricing.
          </h2>
          <p className="mt-4 text-muted-foreground text-lg max-w-xl mx-auto">
            No per-release fees. No commission. No fine print.
          </p>

          {/* Toggle */}
          <div className="mt-8 inline-flex items-center gap-3 bg-surface rounded-full p-1 border border-border">
            <button
              onClick={() => setYearly(false)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                !yearly ? 'bg-lime text-black' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setYearly(true)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                yearly ? 'bg-lime text-black' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Yearly
              <Badge variant="outline" className="ml-2 border-lime/30 text-lime text-[10px] px-1.5 py-0">
                Save 33%
              </Badge>
            </button>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`relative rounded-2xl p-6 lg:p-8 ${
                plan.popular
                  ? 'bg-surface border-2 border-lime/50 glow-border'
                  : 'glass-card'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-lime text-black font-bold px-3 py-1 text-xs">
                    Most Popular
                  </Badge>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-bold">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{plan.description}</p>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-black">
                  ${yearly ? plan.yearlyPrice : plan.monthlyPrice}
                </span>
                <span className="text-muted-foreground text-sm">
                  /{yearly ? 'year' : 'month'}
                </span>
              </div>

              <Button
                className={`w-full font-semibold mb-6 ${
                  plan.popular
                    ? 'bg-lime text-black hover:bg-lime-dark glow-button'
                    : 'bg-surface-light hover:bg-muted text-foreground'
                }`}
              >
                {plan.cta}
              </Button>

              <ul className="space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2.5 text-sm">
                    <Check className="w-4 h-4 text-lime mt-0.5 shrink-0" />
                    <span className="text-muted-foreground">{feature}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}