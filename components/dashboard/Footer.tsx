export default function Footer() {
  return (
    <footer className="bg-white/80 backdrop-blur-sm border-t border-gray-100 mt-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xl">🏏</span>
            <p className="text-sm text-gray-600">
              Built for local cricket communities
            </p>
          </div>

          <nav className="flex items-center gap-6 text-sm">
            <a href="/about" className="text-gray-600 hover:text-green-600 transition-colors">
              About
            </a>
            <a href="/privacy" className="text-gray-600 hover:text-green-600 transition-colors">
              Privacy
            </a>
            <a href="/contact" className="text-gray-600 hover:text-green-600 transition-colors">
              Contact
            </a>
            <a href="/docs" className="text-gray-600 hover:text-green-600 transition-colors">
              Docs
            </a>
          </nav>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-100 text-center">
          <p className="text-xs text-gray-500">
            © 2025 Local League Cricket. Made with ❤️ for cricket lovers.
          </p>
        </div>
      </div>
    </footer>
  )
}