'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Trophy, Users, BarChart3, Share2, Shield, Zap } from 'lucide-react'
import ScrollAnimation from '@/components/animations/ScrollAnimation'

interface Feature {
  icon: React.ReactNode
  title: string
  description: string
  gradient: string
}

const features: Feature[] = [
  {
    icon: <Trophy className="h-6 w-6" />,
    title: 'Create Custom Matches',
    description: 'Set up matches with custom rules, overs, and team configurations in seconds.',
    gradient: 'from-yellow-400 to-orange-400',
  },
  {
    icon: <Zap className="h-6 w-6" />,
    title: 'Live Score Updates',
    description: 'Real-time scoring with ball-by-ball updates visible to all viewers instantly.',
    gradient: 'from-blue-400 to-cyan-400',
  },
  {
    icon: <BarChart3 className="h-6 w-6" />,
    title: 'Player Stats & Highlights',
    description: 'Track individual performances, milestones, and match highlights automatically.',
    gradient: 'from-purple-400 to-pink-400',
  },
  {
    icon: <Share2 className="h-6 w-6" />,
    title: 'Private Match Codes',
    description: 'Share unique match codes with players and fans for exclusive access.',
    gradient: 'from-green-400 to-emerald-400',
  },
  {
    icon: <Users className="h-6 w-6" />,
    title: 'Team Management',
    description: 'Manage squads, lineups, and player availability with ease.',
    gradient: 'from-indigo-400 to-blue-400',
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: 'Secure & Private',
    description: 'Your match data is secure with role-based access control.',
    gradient: 'from-red-400 to-rose-400',
  },
]

export default function Features() {
  return (
    <section className="py-20 bg-gradient-to-b from-white to-gray-50" id="features">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollAnimation>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Everything you need for{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-accent-600">
                local cricket
              </span>
            </h2>
            <p className="text-xl text-gray-600">
              Professional features designed for grassroots cricket. Simple enough for anyone, 
              powerful enough for serious leagues.
            </p>
          </div>
        </ScrollAnimation>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <ScrollAnimation key={index} delay={index * 0.1}>
              <Card className="group hover:scale-105 transition-transform duration-300 h-full">
                <CardHeader>
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${feature.gradient} text-white mb-4 group-hover:scale-110 transition-transform`}>
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </ScrollAnimation>
          ))}
        </div>
      </div>
    </section>
  )
}