import { useState } from 'react'
import { AgentCard } from './AgentCard'
import { Search, Filter } from 'lucide-react'
import { Input } from '../shared/Input'
import { Button } from '../shared/Button'
import { motion } from 'framer-motion'
import { VoiceInput } from '../shared/VoiceInput'

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
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Input
            placeholder="Search agents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pr-12"
            icon={<Search className="w-4 h-4 text-gray-400" />}
          />
          <VoiceInput
            onTranscript={(transcript) => setSearch(transcript)}
            className="absolute right-2 top-1/2 -translate-y-1/2"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={filter === 'all' ? 'primary' : 'outline'}
            onClick={() => setFilter('all')}
          >
            All
          </Button>
          <Button
            variant={filter === 'sale' ? 'primary' : 'outline'}
            onClick={() => setFilter('sale')}
          >
            For Sale
          </Button>
          <Button
            variant={filter === 'rent' ? 'primary' : 'outline'}
            onClick={() => setFilter('rent')}
          >
            For Rent
          </Button>
        </div>
      </div>

      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        layout
      >
        {filteredAgents.map(agent => (
          <AgentCard
            key={agent.tokenId}
            agent={agent}
            onBuy={onBuy}
            onRent={onRent}
          />
        ))}
      </motion.div>

      {filteredAgents.length === 0 && (
        <div className="text-center py-12">
          <Filter className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-300">No agents found</h3>
          <p className="text-gray-400">Try adjusting your search or filter</p>
        </div>
      )}
    </div>
  )
} 