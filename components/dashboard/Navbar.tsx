'use client'

import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { LogOut, Plus, Bell, Settings } from 'lucide-react'
import { useState } from 'react'
import { Logo } from '../ui/Logo'

interface NavbarProps {
  user: {
    id: string;
    name: string;
    email: string;
  } | null;
  onLogout?: () => void;
}

export default function Navbar({ user, onLogout }: NavbarProps) {
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleLogout = () => {
    if (onLogout) {
      onLogout()
    } else {
      localStorage.clear()
      router.push('/login')
    }
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div 
            className="flex items-center gap-3 cursor-pointer"
            onClick={() => router.push('/dashboard')}
          >
            {/* --- 2. THIS IS THE CHANGE --- */}
            <Logo className="h-16 w-16" /> 
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Crick<span className="text-primary-600">Live</span>
              </h1>
            {/* --- END OF CHANGE --- */}
              <p className="text-xs text-gray-500 hidden sm:block">Score with friends</p>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Create Match Button - Desktop */}
            <Button 
              className="hidden sm:flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white shadow-md hover:shadow-lg transition-all"
              onClick={() => router.push('/matches/create')}
            >
              <Plus className="h-4 w-4" />
              Create Match
            </Button>

            {/* Notifications */}
            <button className="p-2 hover:bg-gray-100 rounded-xl transition-colors relative">
              <Bell className="h-5 w-5 text-gray-600" />
              <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                2
              </span>
            </button>

            {/* User Menu */}
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-xl transition-colors"
              >
                <div className="h-9 w-9 bg-gradient-to-br from-green-400 to-emerald-400 rounded-xl flex items-center justify-center text-white font-semibold shadow-sm">
                  {user?.name?.charAt(0).toUpperCase() || 'U'}
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-sm font-medium text-gray-900">{user?.name || 'User'}</p>
                  <p className="text-xs text-gray-500">{user?.email || 'email@example.com'}</p>
                </div>
              </button>

              {/* Dropdown Menu */}
              {isMenuOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-10"
                    onClick={() => setIsMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-20">
                    <button
                      onClick={() => router.push('/profile')}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      Profile
                    </button>
                    <button
                      onClick={() => router.push('/settings')}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                      <Settings className="h-4 w-4" />
                      Settings
                    </button>
                    <hr className="my-2 border-gray-100" />
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Create Button */}
      <button
        onClick={() => router.push('/matches/create')}
        className="fixed bottom-6 right-6 sm:hidden bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-full p-4 shadow-lg z-40 hover:scale-110 transition-transform"
      >
        <Plus className="h-6 w-6" />
      </button>
    </header>
  )
}