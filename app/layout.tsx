import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  title: 'Local League Cricket Scoreboard - Bring Local Cricket Online',
  description: 'Create, manage, and share live scorecards for your local leagues and friendly matches.',
  keywords: 'cricket, scoreboard, local cricket, live scores, cricket app, match scoring',
  authors: [{ name: 'Local League Cricket' }],
  openGraph: {
    title: 'Local League Cricket Scoreboard',
    description: 'Create, manage, and share live scorecards for your local leagues and friendly matches.',
    url: 'https://localleaguecricket.com',
    siteName: 'Local League Cricket Scoreboard',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Local League Cricket Scoreboard',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Local League Cricket Scoreboard',
    description: 'Create, manage, and share live scorecards for your local leagues and friendly matches.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
  viewport: 'width=device-width, initial-scale=1',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased bg-white text-gray-900">
        {children}
      </body>
    </html>
  )
}