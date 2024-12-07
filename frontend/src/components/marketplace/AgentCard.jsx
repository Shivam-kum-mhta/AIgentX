import { motion } from 'framer-motion'
import { ethers } from 'ethers'
import { Button } from '../shared/Button'
import { Star, Clock, MessageCircle } from 'lucide-react'
import { useWeb3 } from '../../context/Web3Context'
import { useNavigate } from 'react-router-dom'



export function AgentCard({ agent, onBuy, onRent }) {
  const navigate = useNavigate()
  const {
    tokenId,
    tokenURI,
    name,
    description,
    image,
    marketPrice,
    rentPrice,
    rating,
    ratingCount,
    isForSale,
    isForRent,
  } = agent
  const { account } = useWeb3()
  const betterDescription = 'Prompt: ' + description
  console.log('account from the agent card is here', account)
  console.log('tokenURI from the agent card is here', tokenURI)
  console.log('tokenId from the agent card is here', tokenId)

  const handleChatClick = () => {
    navigate(`/chat/${tokenURI}`)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gray-800 rounded-xl overflow-hidden border border-gray-700 hover:border-purple-500 transition-colors"
    >
      <div className="aspect-square relative">
        <img
          src={image}
          alt={name}
          className="w-full h-full object-cover"
        />
        {(isForSale || isForRent) && (
          <div className="absolute top-2 right-2 flex space-x-2">
            {isForSale && (
              <span className="px-2 py-1 bg-purple-500 rounded-full text-xs font-medium">
                For Sale
              </span>
            )}
            {isForRent && (
              <span className="px-2 py-1 bg-pink-500 rounded-full text-xs font-medium">
                For Rent
              </span>
            )}
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-lg font-medium mb-2">{name}</h3>
        <p className="text-gray-400 text-sm mb-4 line-clamp-2">
          {betterDescription}
        </p>

        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Star className="w-4 h-4 text-yellow-500 mr-1" />
            <span className="text-sm">
             {/* {rating.toFixed(1)} ({ratingCount}) */}
            </span>
          </div>
          {isForRent && (
            <div className="flex items-center text-sm text-gray-400">
              <Clock className="w-4 h-4 mr-1" />
              <span>{ethers.utils.formatEther(rentPrice)} ETH/day</span>
            </div>
          )}
        </div>

        <div className="flex space-x-2">
          {isForSale && (
            <Button
              onClick={() => onBuy(tokenId)}
              className="flex-1"
            >
              Buy for {ethers.utils.formatEther(marketPrice)} ETH
            </Button>
          )}
          {isForRent && (
            <Button
              onClick={() => onRent(tokenId)}
              variant="secondary"
              className="flex-1"
            >
              Rent
            </Button>
          )}
          <Button
            onClick={handleChatClick}
            variant="secondary"
            className="flex items-center justify-center px-4"
          >
            <MessageCircle className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  )
} 