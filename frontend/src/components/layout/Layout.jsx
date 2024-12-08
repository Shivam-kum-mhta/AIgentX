import { Header } from './Header'
import { AnimatedBackground } from '../shared/AnimatedBackground'
import { motion } from 'framer-motion'

export function Layout({ children }) {
  return (
    <div className="relative min-h-screen">
      {/* Global Background */}
      <AnimatedBackground />
      
      {/* Global Gradient Overlay - Very Transparent */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Vertical gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-gray-950/40 via-transparent to-gray-950/40" />
        {/* Horizontal gradient */}
        <div className="absolute inset-0 bg-gradient-to-r from-purple-900/10 via-transparent to-purple-900/10" />
        {/* Subtle ambient glow spots */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <Header />
        <motion.main 
          className="container mx-auto px-4 pt-24 pb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {children}
        </motion.main>
      </div>
    </div>
  )
} 