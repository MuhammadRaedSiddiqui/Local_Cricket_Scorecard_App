import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard - Local League Cricket Scoreboard',
  description: 'Manage your cricket matches, teams, and scores',
}

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}