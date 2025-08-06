import Link from 'next/link'

export function Footer() {
  return (
    <footer className="bg-gray-50 dark:bg-slate-900 border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-etcetera-500 to-etcetera-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">∞</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-etcetera-600 to-etcetera-500 bg-clip-text text-transparent">
                etcetera.exchange
              </span>
            </div>
            <p className="text-gray-600 dark:text-gray-400 mb-4 max-w-md">
              A whimsical universe where everyday objects become extraordinary treasures. 
              Join our magical community on Bluesky and start collecting today!
            </p>
            <div className="flex space-x-4">
              <a
                href="https://bsky.app/profile/etcetera.exchange"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-etcetera-500 transition-colors"
              >
                <span className="sr-only">Bluesky</span>
                🦋
              </a>
              <a
                href="https://github.com/your-repo/etcetera-exchange"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-etcetera-500 transition-colors"
              >
                <span className="sr-only">GitHub</span>
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white tracking-wider uppercase mb-4">
              Explore
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-gray-600 dark:text-gray-400 hover:text-etcetera-500 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/leaderboard" className="text-gray-600 dark:text-gray-400 hover:text-etcetera-500 transition-colors">
                  Leaderboard
                </Link>
              </li>
              <li>
                <Link href="/objects" className="text-gray-600 dark:text-gray-400 hover:text-etcetera-500 transition-colors">
                  Object Catalog
                </Link>
              </li>
              <li>
                <a
                  href="https://bsky.app/profile/etcetera.exchange"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 dark:text-gray-400 hover:text-etcetera-500 transition-colors"
                >
                  Bot Profile
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white tracking-wider uppercase mb-4">
              Community
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="text-gray-600 dark:text-gray-400 hover:text-etcetera-500 transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-600 dark:text-gray-400 hover:text-etcetera-500 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-600 dark:text-gray-400 hover:text-etcetera-500 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-600 dark:text-gray-400 hover:text-etcetera-500 transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              © {new Date().getFullYear()} etcetera.exchange. Made with ✨ and a lot of whimsy.
            </p>
            <div className="mt-4 md:mt-0">
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                Powered by{' '}
                <a 
                  href="https://bsky.social" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-etcetera-500 hover:text-etcetera-600 transition-colors"
                >
                  Bluesky
                </a>
                {' '}and{' '}
                <a 
                  href="https://ai.google.dev/gemini-api" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-etcetera-500 hover:text-etcetera-600 transition-colors"
                >
                  Gemini
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}