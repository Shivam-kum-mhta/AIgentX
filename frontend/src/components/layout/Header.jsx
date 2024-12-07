import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useWeb3 } from '../../context/Web3Context'
import { Button } from '../shared/Button'
import { Menu, X, Wallet } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const { account, connectWallet } = useWeb3()

  const menuItems = [
    { label: 'Home', path: '/' },
    { label: 'Mint', path: '/mint' },
    { label: 'Marketplace', path: '/marketplace' },
    { label: 'My Agents', path: '/my-agents' }
  ]

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-gray-900/80 backdrop-blur-sm border-b border-gray-800">
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 text-transparent bg-clip-text">
            AIgentX
          </Link>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {menuItems.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className="text-gray-300 hover:text-white transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="hidden md:block">
            <Button
              onClick={connectWallet}
              variant="outline"
              className="flex items-center"
            >
              <Wallet className="w-4 h-4 mr-2" />
              {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'Connect Wallet'}
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-gray-300"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden mt-4"
            >
              <div className="flex flex-col space-y-4">
                {menuItems.map(item => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="text-gray-300 hover:text-white transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
                <Button
                  onClick={connectWallet}
                  variant="outline"
                  className="flex items-center"
                >
                  <Wallet className="w-4 h-4 mr-2" />
                  {account ? `${account.slice(0, 6)}...${account.slice(-4)}` : 'Connect Wallet'}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  )
} 