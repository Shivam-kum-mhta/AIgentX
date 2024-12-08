import { useState } from 'react'
import { AgentCard } from './AgentCard'
import { Search, Filter } from 'lucide-react'
import { Input } from '../shared/Input'
import { Button } from '../shared/Button'
import { motion } from 'framer-motion'
import { VoiceInput } from '../shared/VoiceInput'

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
}

export function AgentGrid({ agents, onBuy, onRent }) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all') // all, sale, rent

  const filteredAgents = agents.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(search.toLowerCase()) ||
                         agent.description.toLowerCase().includes(search.toLowerCase())
    
    if (filter === 'sale') return matchesSearch && agent.isForSale
    if (filter === 'rent') return matchesSearch && agent.isForRent
    return matchesSearch
  })

  return (
    <div className="relative">
      {/* Background glow spots */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      {/* Grid */}
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
      >
        {filteredAgents.map((agent, index) => (
          <motion.div
            key={agent.tokenId}
            variants={item}
            className="group"
          >
            <AgentCard 
              agent={agent}
              onBuy={onBuy}
              onRent={onRent}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Empty state */}
      {filteredAgents.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-20"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-purple-500/10 mb-6">
            <div className="w-10 h-10 rounded-full bg-purple-500/20 animate-pulse" />
          </div>
          <h3 className="text-xl font-medium mb-2">No Agents Found</h3>
          <p className="text-gray-400">Be the first to create an AI agent!</p>
        </motion.div>
      )}
    </div>
  )
} 