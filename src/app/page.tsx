import { auth } from '@/auth'
import { Intro } from '@/components/landing/Intro'
import { Navbar } from '@/components/landing/Navbar'
import { Hero } from '@/components/landing/Hero'
import { PlatformLogos } from '@/components/landing/PlatformLogos'
import { HowItWorks } from '@/components/landing/HowItWorks'
import { VideoShowcase } from '@/components/landing/VideoShowcase'
import { Features } from '@/components/landing/Features'
import { DashboardPreview } from '@/components/landing/DashboardPreview'
import { FAQ } from '@/components/landing/FAQ'
import { CTASection } from '@/components/landing/CTASection'
import { Footer } from '@/components/landing/Footer'

export default async function Home() {
  const session = await auth()
  return (
    <Intro>
      <div className="min-h-screen flex flex-col">
        <Navbar session={session} />
        <main className="flex-1 noise-overlay relative">
          <Hero />
          <PlatformLogos />
          <HowItWorks />
          <VideoShowcase />
          <Features />
          <DashboardPreview />
          <FAQ />
          <CTASection />
        </main>
        <Footer />
      </div>
    </Intro>
  )
}