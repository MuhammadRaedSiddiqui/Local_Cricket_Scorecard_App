import { Heart } from 'lucide-react'

export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="bg-gray-50 border-t border-gray-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col items-center space-y-6">
          {/* Logo */}
          <div className="text-2xl font-bold text-gray-900">
            Local League <span className="text-primary-600">Cricket</span>
          </div>

          {/* Links */}
          <nav className="flex flex-wrap justify-center gap-8">
            <a 
              href="#about" 
              className="text-gray-600 hover:text-primary-600 transition-colors"
              aria-label="About"
            >
              About
            </a>
            <a 
              href="#contact" 
              className="text-gray-600 hover:text-primary-600 transition-colors"
              aria-label="Contact"
            >
              Contact
            </a>
            <a 
              href="#privacy" 
              className="text-gray-600 hover:text-primary-600 transition-colors"
              aria-label="Privacy Policy"
            >
              Privacy Policy
            </a>
            <a 
              href="#terms" 
              className="text-gray-600 hover:text-primary-600 transition-colors"
              aria-label="Terms of Service"
            >
              Terms
            </a>
          </nav>

          {/* Copyright */}
          <div className="text-center text-sm text-gray-500">
            <p className="flex items-center gap-1">
              Made with <Heart className="h-4 w-4 text-red-500 fill-current" /> for local cricket
            </p>
            <p className="mt-2">
              © {currentYear} Local League Cricket Scoreboard. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}