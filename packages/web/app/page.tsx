import { Suspense } from 'react'
import { Header } from '@/components/Header'
import { Hero } from '@/components/Hero'
import { MysteryObjectsTeaser } from '@/components/MysteryObjectsTeaser'
import { HowItWorks } from '@/components/HowItWorks'
import { Footer } from '@/components/Footer'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

export default function HomePage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <Hero />
        
        {/* Mystery Objects Section */}
        <section className="py-16 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                🎭 What Awaits Discovery?
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300">
                Thousands of mysterious objects are waiting to be discovered... but we can't spoil the surprise!
              </p>
            </div>
            
            <MysteryObjectsTeaser />
          </div>
        </section>
        
        {/* How It Works Section */}
        <HowItWorks />
        
        {/* Stats Section */}
        <section className="py-16 bg-gradient-to-r from-etcetera-500 to-etcetera-600">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-8">
                The Numbers Tell a Story
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Suspense fallback={<div className="h-24 shimmer rounded-lg" />}>
                  <StatsCard 
                    title="Objects Created" 
                    value="10,000+" 
                    icon="📦" 
                    description="Whimsical items waiting to be discovered"
                  />
                </Suspense>
                
                <Suspense fallback={<div className="h-24 shimmer rounded-lg" />}>
                  <StatsCard 
                    title="Happy Collectors" 
                    value="1,200+" 
                    icon="👥" 
                    description="Adventurers building their collections"
                  />
                </Suspense>
                
                <Suspense fallback={<div className="h-24 shimmer rounded-lg" />}>
                  <StatsCard 
                    title="Gifts Exchanged" 
                    value="3,500+" 
                    icon="🎁" 
                    description="Acts of kindness in our community"
                  />
                </Suspense>
              </div>
            </div>
          </div>
        </section>
        
        {/* CTA Section */}
        <section className="py-16 bg-white dark:bg-slate-900">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Ready to Start Your Collection? 🌟
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
              Mention <span className="font-mono bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">@etcetera.exchange</span> on Bluesky to claim your first magical object!
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href="https://bsky.app/profile/etcetera.exchange"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-magical text-white px-8 py-3 rounded-lg font-semibold inline-flex items-center justify-center"
              >
                <span className="mr-2">🦋</span>
                Follow on Bluesky
              </a>
              
              <a 
                href="/login"
                className="bg-white dark:bg-slate-800 text-etcetera-600 dark:text-etcetera-400 px-8 py-3 rounded-lg font-semibold border-2 border-etcetera-600 dark:border-etcetera-400 hover:bg-etcetera-50 dark:hover:bg-slate-700 transition-colors inline-flex items-center justify-center"
              >
                <span className="mr-2">👀</span>
                View Your Collection
              </a>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />
    </div>
  )
}

interface StatsCardProps {
  title: string
  value: string
  icon: string
  description: string
}

function StatsCard({ title, value, icon, description }: StatsCardProps) {
  return (
    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-6 text-center">
      <div className="text-4xl mb-2">{icon}</div>
      <div className="text-3xl font-bold text-white mb-1">{value}</div>
      <div className="text-lg font-semibold text-white/90 mb-2">{title}</div>
      <div className="text-sm text-white/70">{description}</div>
    </div>
  )
}