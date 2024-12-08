import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { WalletSelector } from '../shared/WalletSelector'
import logoPath from '../../../../logo.png'

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const menuItems = [
    { label: 'Home', path: '/' },
    { label: 'Mint', path: '/mint' },
    { label: 'Marketplace', path: '/marketplace' },
    { label: 'My Agents', path: '/my-agents' }
  ]

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'space-card' : 'bg-transparent'
      }`}
    >
      <nav className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="relative w-12 h-12 logo-glow">
              {/* Rotating glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-transparent rounded-full animate-rotate" />
              
              {/* Pulsing glow effect */}
              <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-xl animate-pulse" />
              
              {/* Logo image */}
              <motion.img 
                src={logoPath}
                alt="AIgentX"
                className="relative w-full h-full object-cover rounded-full"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              />
            </div>
            <div className="relative">
              <motion.span 
                className="text-2xl font-bold space-text-gradient neon-glow"
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.2 }}
              >
                AIgentX
              </motion.span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <div className="flex items-center space-x-6">
              {menuItems.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  className="relative group"
                >
                  <span className={`text-sm font-medium transition-colors ${
                    location.pathname === item.path 
                      ? 'text-white neon-glow' 
                      : 'text-gray-400 hover:text-white'
                  }`}>
                    {item.label}
                  </span>
                  <span className={`absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-purple-500 to-transparent transform origin-left transition-transform duration-300 ${
                    location.pathname === item.path ? 'scale-x-100' : 'scale-x-0 group-hover:scale-x-100'
                  }`} />
                </Link>
              ))}
            </div>
            <WalletSelector />
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            className="md:hidden relative z-50 p-2 space-button"
            onClick={() => setIsOpen(!isOpen)}
            whileTap={{ scale: 0.95 }}
          >
            <AnimatePresence mode="wait">
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </AnimatePresence>
          </motion.button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden space-card mt-4"
            >
              <div className="p-4 space-y-4">
                {menuItems.map(item => (
                  <motion.div
                    key={item.path}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Link
                      to={item.path}
                      onClick={() => setIsOpen(false)}
                      className={`block text-lg ${
                        location.pathname === item.path 
                          ? 'text-white neon-glow' 
                          : 'text-gray-400 hover:text-white'
                      }`}
                    >
                      {item.label}
                    </Link>
                  </motion.div>
                ))}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.2, delay: 0.2 }}
                  className="pt-4"
                >
                  <WalletSelector />
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </motion.header>
  )
} 