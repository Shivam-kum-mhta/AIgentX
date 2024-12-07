import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/shared/Button'
import { Bot, Code, Shield } from 'lucide-react'

export function Home() {
  const navigate = useNavigate()

  const features = [
    {
      icon: <Bot className="w-8 h-8" />,
      title: 'AI-Powered Agents',
      description: 'Create and customize your own AI agents with unique capabilities.'
    },
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'Secure Marketplace',
      description: 'Buy, sell, and rent agents securely using blockchain technology.'
    },
    {
      icon: <Code className="w-8 h-8" />,
      title: 'Open Platform',
      description: 'Build and extend agent capabilities with our open API.'
    }
  ]

  return (
    <div className="space-y-20 py-12">
      <motion.div 
        className="text-center space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl md:text-6xl font-bold">
          The Next Generation
          <span className="block bg-gradient-to-r from-purple-400 to-pink-600 text-transparent bg-clip-text">
            AI Agent Marketplace
          </span>
        </h1>
        <p className="text-xl text-gray-400 max-w-2xl mx-auto">
          Create, trade, and utilize AI agents in a decentralized marketplace powered by blockchain technology.
        </p>
        <div className="flex justify-center gap-4">
          <Button onClick={() => navigate('/mint')} size="lg">
            Create Agent
          </Button>
          <Button onClick={() => navigate('/marketplace')} variant="outline" size="lg">
            Explore Marketplace
          </Button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            className="p-6 bg-gray-800 rounded-xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.2 }}
          >
            <div className="bg-purple-500/10 w-16 h-16 rounded-lg flex items-center justify-center text-purple-400 mb-4">
              {feature.icon}
            </div>
            <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
            <p className="text-gray-400">{feature.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  )
} 