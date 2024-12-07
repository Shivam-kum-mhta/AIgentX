import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { MintForm } from '../components/mint/MintForm'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import { Sparkles } from 'lucide-react'

export function Mint() {
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleMintSuccess = (tokenId) => {
    console.log('token id after handling the mint success', tokenId)
    toast.success('Agent minted successfully!')
    navigate(`/agent/${tokenId}`)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        <div className="text-center space-y-4">
          <div className="bg-purple-500/10 w-16 h-16 rounded-full flex items-center justify-center mx-auto">
            <Sparkles className="w-8 h-8 text-purple-400" />
          </div>
          <h1 className="text-3xl font-bold">Create Your AI Agent</h1>
          <p className="text-gray-400">
            Design and mint your unique AI agent as an NFT. Customize its capabilities and make it available on the marketplace.
          </p>
        </div>

        <div className="bg-gray-800 rounded-xl p-6">
          <MintForm onSuccess={handleMintSuccess} />
        </div>
      </motion.div>
    </div>
  )
} 