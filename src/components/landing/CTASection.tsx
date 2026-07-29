'use client'

import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Upload, ArrowRight } from 'lucide-react'

export function CTASection() {
  return (
    <section className="relative py-24 sm:py-32">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight">
            Ready to Take Back
            <br />
            <span className="gradient-text">Your Music?</span>
          </h2>
          <p className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto">
            Join 500,000+ independent artists who trust Resonate to get their
            music heard — and paid for — on their own terms.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              size="lg"
              className="bg-lime text-black hover:bg-lime-dark font-bold text-base px-8 py-6 glow-button w-full sm:w-auto"
            >
              <Upload className="w-5 h-5 mr-2" />
              Upload Your First Track — Free
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-border hover:border-lime/50 hover:text-lime text-base px-8 py-6 w-full sm:w-auto"
            >
              Compare Plans
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            No credit card required. Free 14-day trial on all plans.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
