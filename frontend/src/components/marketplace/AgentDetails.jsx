import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { ethers } from 'ethers'
import { useContract } from '../../hooks/useContract'
import { Button } from '../shared/Button'
import { Input } from '../shared/Input'
import { Star, Clock, DollarSign, Calendar } from 'lucide-react'
import { motion } from 'framer-motion'
import { VoiceButton } from '../shared/VoiceButton'

export function AgentDetails() {
  const { tokenId } = useParams()
  const { buyAgent, rentAgent, rateAgent } = useContract()
  const [rentDays, setRentDays] = useState(1)
  const [rating, setRating] = useState(0)
  const [loading, setLoading] = useState(false)

  // This would be fetched from your contract/API
  const agent = {
    tokenId,
    name: "AI Assistant Pro",
    description: "A powerful AI agent that can help with various tasks...",
    image: "https://example.com/image.jpg",
    marketPrice: ethers.utils.parseEther("0.1"),
    rentPrice: ethers.utils.parseEther("0.01"),
    rating: 4.5,
    ratingCount: 10,
    isForSale: true,
    isForRent: true
  }

  const handleBuy = async () => {
    setLoading(true)
    try {
      await buyAgent(tokenId, agent.marketPrice)
      // Handle success (e.g., show notification, redirect)
    } catch (error) {
      console.error('Error buying agent:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRent = async () => {
    setLoading(true)
    try {
      const totalPrice = ethers.utils.parseEther(
        (parseFloat(ethers.utils.formatEther(agent.rentPrice)) * rentDays).toString()
      )
      await rentAgent(tokenId, rentDays, totalPrice)
      // Handle success
    } catch (error) {
      console.error('Error renting agent:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRate = async () => {
    try {
      await rateAgent(tokenId, rating)
      // Handle success
    } catch (error) {
      console.error('Error rating agent:', error)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="grid grid-cols-1 md:grid-cols-2 gap-8"
    >
      <div className="space-y-6">
        <div className="aspect-square rounded-xl overflow-hidden">
          <img
            src={agent.image}
            alt={agent.name}
            className="w-full h-full object-cover"
          />
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center">
            <Star className="w-5 h-5 text-yellow-500 mr-1" />
            <span className="text-lg">
              {agent.rating.toFixed(1)} ({agent.ratingCount})
            </span>
          </div>
          {agent.isForRent && (
            <div className="flex items-center text-gray-400">
              <Clock className="w-5 h-5 mr-1" />
              <span>{ethers.utils.formatEther(agent.rentPrice)} ETH/day</span>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-4">
            {agent.name}
            <VoiceButton text={`${agent.name}. ${agent.description}`} />
          </h1>
          <p className="text-gray-400">{agent.description}</p>
        </div>

        {agent.isForSale && (
          <div className="p-4 bg-gray-800 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg">Purchase Price</span>
              <span className="text-2xl font-bold">
                {ethers.utils.formatEther(agent.marketPrice)} ETH
              </span>
            </div>
            <Button
              onClick={handleBuy}
              loading={loading}
              className="w-full"
            >
              <DollarSign className="w-4 h-4 mr-2" />
              Buy Now
            </Button>
          </div>
        )}

        {agent.isForRent && (
          <div className="p-4 bg-gray-800 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg">Rent</span>
              <div className="flex items-center">
                <Input
                  type="number"
                  min="1"
                  value={rentDays}
                  onChange={(e) => setRentDays(parseInt(e.target.value))}
                  className="w-24 mr-2"
                />
                <span>days</span>
              </div>
            </div>
            <div className="flex items-center justify-between mb-4">
              <span>Total Price</span>
              <span className="text-2xl font-bold">
                {(parseFloat(ethers.utils.formatEther(agent.rentPrice)) * rentDays).toFixed(4)} ETH
              </span>
            </div>
            <Button
              onClick={handleRent}
              loading={loading}
              variant="secondary"
              className="w-full"
            >
              <Calendar className="w-4 h-4 mr-2" />
              Rent Now
            </Button>
          </div>
        )}

        <div className="p-4 bg-gray-800 rounded-lg">
          <h3 className="text-lg font-medium mb-4">Rate this Agent</h3>
          <div className="flex items-center space-x-2 mb-4">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                onClick={() => setRating(value)}
                className={`p-1 rounded-full transition-colors ${
                  rating >= value ? 'text-yellow-500' : 'text-gray-400'
                }`}
              >
                <Star className="w-6 h-6" />
              </button>
            ))}
          </div>
          <Button
            onClick={handleRate}
            disabled={!rating}
            variant="outline"
            className="w-full"
          >
            Submit Rating
          </Button>
        </div>
      </div>
    </motion.div>
  )
} 