import { motion } from 'framer-motion'
import { Bot } from 'lucide-react'

export function LoadingSpinner() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-900/80 backdrop-blur-sm z-50">
      <div className="relative">
        {/* Rotating circles */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-500 border-r-purple-500"
        />
        <motion.div
          animate={{ rotate: -360 }}
          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 rounded-full border-4 border-transparent border-b-pink-500 border-l-pink-500"
        />
        
        {/* Center bot icon */}
        <motion.div
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 360, 0]
          }}
          transition={{ 
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="relative w-16 h-16 flex items-center justify-center"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full blur-xl" />
          <Bot className="w-8 h-8 text-white" />
        </motion.div>

        {/* Loading text */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute -bottom-12 left-1/2 -translate-x-1/2 whitespace-nowrap"
        >
          <motion.span
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="text-lg font-medium bg-gradient-to-r from-purple-400 to-pink-500 text-transparent bg-clip-text"
          >
            Loading AI Magic...
          </motion.span>
        </motion.div>
      </div>
    </div>
  )
} 