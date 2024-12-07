import { Github, Twitter } from 'lucide-react'

export function Footer() {
  return (
    <footer className="bg-gray-900 border-t border-gray-800">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 text-transparent bg-clip-text mb-4">
              AIgentX
            </h3>
            <p className="text-gray-400">
              The next generation AI agent marketplace powered by blockchain technology.
            </p>
          </div>

          <div>
            <h4 className="text-white font-medium mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <a href="/mint" className="text-gray-400 hover:text-white transition-colors">
                  Mint Agent
                </a>
              </li>
              <li>
                <a href="/marketplace" className="text-gray-400 hover:text-white transition-colors">
                  Marketplace
                </a>
              </li>
              <li>
                <a href="/my-agents" className="text-gray-400 hover:text-white transition-colors">
                  My Agents
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-medium mb-4">Connect</h4>
            <div className="flex space-x-4">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Github className="w-6 h-6" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-400 hover:text-white transition-colors"
              >
                <Twitter className="w-6 h-6" />
              </a>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
          <p>© {new Date().getFullYear()} AIgentX. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
} 