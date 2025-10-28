'use client'

import { Shield, Eye, Edit, Users, Lock, Smartphone } from 'lucide-react'
import ScrollAnimation from '@/components/animations/ScrollAnimation'
import { Card } from '@/components/ui/card'

export default function AdminUserAccess() {
  return (
    <section className="py-20 bg-white" id="access">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollAnimation>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Perfect for{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-accent-600">
                everyone
              </span>
            </h2>
            <p className="text-xl text-gray-600">
              Different access levels for scorers, players, and fans
            </p>
          </div>
        </ScrollAnimation>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {/* Admin Access */}
          <ScrollAnimation delay={0.1}>
            <Card className="p-8 h-full bg-gradient-to-br from-primary-50 to-white border-primary-200">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-primary-100 rounded-xl">
                  <Shield className="h-6 w-6 text-primary-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Match Admin</h3>
              </div>
              
              <p className="text-gray-600 mb-8">
                Full control over match scoring and management
              </p>
              
              <div className="space-y-4">
                {[
                  { icon: <Edit className="h-5 w-5" />, text: 'Update scores ball-by-ball' },
                  { icon: <Users className="h-5 w-5" />, text: 'Manage teams and lineups' },
                  { icon: <Lock className="h-5 w-5" />, text: 'Control match settings' },
                  { icon: <Smartphone className="h-5 w-5" />, text: 'Mobile-friendly scoring' },
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="text-primary-600">{feature.icon}</div>
                    <span className="text-gray-700">{feature.text}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-4 bg-primary-100/50 rounded-xl">
                <p className="text-sm text-primary-700 font-medium">
                  Ideal for: Umpires, Scorers, Team Captains
                </p>
              </div>
            </Card>
          </ScrollAnimation>

          {/* User Access */}
          <ScrollAnimation delay={0.2}>
            <Card className="p-8 h-full bg-gradient-to-br from-accent-50 to-white border-accent-200">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-3 bg-accent-100 rounded-xl">
                  <Eye className="h-6 w-6 text-accent-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900">Viewer Access</h3>
              </div>
              
              <p className="text-gray-600 mb-8">
                Follow matches and view live scores in real-time
              </p>
              
              <div className="space-y-4">
                {[
                  { icon: <Eye className="h-5 w-5" />, text: 'View live scores' },
                  { icon: <Users className="h-5 w-5" />, text: 'See player statistics' },
                  { icon: <Smartphone className="h-5 w-5" />, text: 'Access from any device' },
                  { icon: <Shield className="h-5 w-5" />, text: 'Join with match code' },
                ].map((feature, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="text-accent-600">{feature.icon}</div>
                    <span className="text-gray-700">{feature.text}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 p-4 bg-accent-100/50 rounded-xl">
                <p className="text-sm text-accent-700 font-medium">
                  Ideal for: Players, Fans, Parents, Coaches
                </p>
              </div>
            </Card>
          </ScrollAnimation>
        </div>
      </div>
    </section>
  )
}