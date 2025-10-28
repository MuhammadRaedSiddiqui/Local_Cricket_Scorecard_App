import Hero from '@/components/sections/Hero'
import Features from '@/components/sections/Features'
import HowItWorks from '@/components/sections/HowItWorks'
import LiveMatchPreview from '@/components/sections/LiveMatchPreview'
import AdminUserAccess from '@/components/sections/AdminUserAccess'
import CallToAction from '@/components/sections/CallToAction'
import Footer from '@/components/sections/Footer'

export default function Home() {
  return (
    <main className="min-h-screen">
      <Hero />
      <Features />
      <HowItWorks />
      <LiveMatchPreview />
      <AdminUserAccess />
      <CallToAction />
      <Footer />
    </main>
  )
}