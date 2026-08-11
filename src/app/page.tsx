'use client'

import { Intro } from '@/components/landing/Intro'
import { Navbar } from '@/components/landing/Navbar'
import { Hero } from '@/components/landing/Hero'
import { PlatformLogos } from '@/components/landing/PlatformLogos'
import { Comparison } from '@/components/landing/Comparison'
import { HowItWorks } from '@/components/landing/HowItWorks'
import { VideoShowcase } from '@/components/landing/VideoShowcase'
import { Features } from '@/components/landing/Features'
import { DashboardPreview } from '@/components/landing/DashboardPreview'
import { Pricing } from '@/components/landing/Pricing'
import { Testimonials } from '@/components/landing/Testimonials'
import { FAQ } from '@/components/landing/FAQ'
import { CTASection } from '@/components/landing/CTASection'
import { Footer } from '@/components/landing/Footer'

export default function Home() {
  return (
    <Intro>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 noise-overlay relative">
          <Hero />
          <PlatformLogos />
          <Comparison />
          <HowItWorks />
          <VideoShowcase />
          <Features />
          <DashboardPreview />
          <Pricing />
          <Testimonials />
          <FAQ />
          <CTASection />
        </main>
        <Footer />
      </div>
    </Intro>
  )
}