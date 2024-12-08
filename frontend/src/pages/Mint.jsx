import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MintForm } from '../components/mint/MintForm'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { Sparkles, Brain } from 'lucide-react'
import { VoiceInput } from '../components/shared/VoiceInput'

export function Mint() {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleMintSuccess = (tokenId) => {
    console.log('token id after handling the mint success', tokenId)
    toast.success('Agent minted successfully!')
    navigate(`/agent/${tokenId}`)
  }

  return (
    <div className="relative min-h-screen py-20">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse animation-delay-2000" />
      </div>

      {/* Content */}
      <div className="relative container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center space-x-4 mb-6">
            <div className="relative">
              <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-xl animate-pulse" />
              <div className="relative p-4 bg-[#12141F]/60 rounded-full">
                <Brain className="w-8 h-8 text-purple-400" />
              </div>
            </div>
            <h1 className="text-3xl font-bold space-text-gradient">Create AI Agent</h1>
          </div>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Bring your AI agent to life with custom capabilities and personalities
          </p>
        </motion.div>

        {/* Form */}
        <MintForm onSuccess={handleMintSuccess} />
      </div>
    </div>
  )
} 