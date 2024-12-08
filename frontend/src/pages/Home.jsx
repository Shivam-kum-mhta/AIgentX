import { motion } from 'framer-motion'
import { ArrowRight, Brain, Bot, Coins, Sparkles, Code } from 'lucide-react'
import { Link } from 'react-router-dom'
import { AnimatedBackground } from '../components/shared/AnimatedBackground'

const features = [
  {
    icon: Bot,
    title: "AI-Powered Agents",
    description: "Create unique AI agents with custom personalities and capabilities",
    gradient: "from-purple-500/20 to-pink-500/20"
  },
  {
    icon: Coins,
    title: "NFT Marketplace",
    description: "Buy, sell, and rent AI agents securely on the blockchain",
    gradient: "from-blue-500/20 to-purple-500/20"
  },
  {
    icon: Code,
    title: "Smart Contracts",
    description: "Powered by secure and transparent blockchain technology",
    gradient: "from-pink-500/20 to-purple-500/20"
  }
]

export function Home() {
  return (
    <div className="relative min-h-screen">
      {/* Three.js Background */}
      <AnimatedBackground />

      {/* Hero Section */}
      <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
        {/* Circle Container */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative w-[600px] h-[600px] scale-90">
            {/* Outer glowing circles */}
            <div className="absolute inset-0 rounded-full bg-purple-500/5 blur-3xl animate-pulse" />
            <div className="absolute inset-0 rounded-full bg-purple-500/10 blur-2xl animate-pulse animation-delay-2000" />
            
            {/* Rotating gradient border */}
            <div className="absolute inset-[2px] rounded-full animate-spin-slow">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-500/20 to-transparent blur-lg" />
            </div>

            {/* Inner content container */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6">
              {/* Brain Icon with glow */}
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="relative mb-6"
              >
                <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-xl animate-pulse" />
                <Brain className="w-16 h-16 text-purple-400 relative" />
              </motion.div>

              {/* Logo Text */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-5xl md:text-7xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-purple-400 to-purple-300"
              >
                AIgentX
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-lg md:text-xl text-gray-300 mb-8 text-center max-w-xl"
              >
                The next generation decentralized AI agent marketplace powered by blockchain technology
              </motion.p>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex flex-col md:flex-row gap-4"
              >
                <Link 
                  to="/mint"
                  className="space-button bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 text-white flex items-center group"
                >
                  Create Agent
                  <ArrowRight className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link 
                  to="/marketplace"
                  className="space-button hover:bg-purple-500/5"
                >
                  Explore Marketplace
                </Link>
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="relative -mt-32 pb-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 + index * 0.2 }}
                whileHover={{ y: -5, scale: 1.02 }}
                className="relative group"
              >
                {/* Card Background */}
                <div className="absolute inset-0 bg-[#12141F]/40 rounded-2xl backdrop-blur-sm border border-gray-700/50 transition-all duration-300 group-hover:border-purple-500/30" />
                
                {/* Gradient Glow */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl`} />
                
                {/* Content */}
                <div className="relative p-6 space-y-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <feature.icon className="w-6 h-6 text-purple-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-white">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400">
                    {feature.description}
                  </p>
                </div>

                {/* Animated Border */}
                <div className="absolute inset-0 rounded-2xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </div>
  )
} 