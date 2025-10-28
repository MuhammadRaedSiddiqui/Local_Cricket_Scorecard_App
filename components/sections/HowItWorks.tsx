'use client'

import { PlusCircle, Edit3, Share } from 'lucide-react'
import ScrollAnimation from '@/components/animations/ScrollAnimation'

const steps = [
  {
    number: '01',
    title: 'Create',
    description: 'Set up your match with teams, players, and match format',
    icon: <PlusCircle className="h-8 w-8" />,
    color: 'from-blue-500 to-cyan-500',
  },
  {
    number: '02',
    title: 'Score',
    description: 'Update scores ball-by-ball with our intuitive scoring interface',
    icon: <Edit3 className="h-8 w-8" />,
    color: 'from-purple-500 to-pink-500',
  },
  {
    number: '03',
    title: 'Share',
    description: 'Share live match links with players, fans, and followers',
    icon: <Share className="h-8 w-8" />,
    color: 'from-orange-500 to-red-500',
  },
]

export default function HowItWorks() {
  return (
    <section className="py-20 bg-white" id="how-it-works">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollAnimation>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Get started in{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-accent-600">
                three simple steps
              </span>
            </h2>
            <p className="text-xl text-gray-600">
              From setup to live scoring in under a minute
            </p>
          </div>
        </ScrollAnimation>

        <div className="relative">
          {/* Connection Line - Hidden on mobile */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-200 via-purple-200 to-orange-200 -translate-y-1/2"></div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {steps.map((step, index) => (
              <ScrollAnimation key={index} delay={index * 0.2}>
                <div className="relative">
                  <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow duration-300 border border-gray-100">
                    {/* Step Number */}
                    <div className="absolute -top-4 -right-4 bg-white rounded-full p-2 shadow-md">
                      <div className={`bg-gradient-to-r ${step.color} text-white text-sm font-bold rounded-full w-8 h-8 flex items-center justify-center`}>
                        {index + 1}
                      </div>
                    </div>
                    
                    {/* Icon */}
                    <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${step.color} text-white mb-6`}>
                      {step.icon}
                    </div>
                    
                    {/* Content */}
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">{step.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{step.description}</p>
                  </div>
                </div>
              </ScrollAnimation>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}