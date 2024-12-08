import { motion } from 'framer-motion'
import { ethers } from 'ethers'
import { Button } from '../shared/Button'
import { Star, Clock, MessageCircle, Tag, Coins } from 'lucide-react'
import { useWeb3 } from '../../context/Web3Context'
import { useNavigate } from 'react-router-dom'

export function AgentCard({ agent, onBuy, onRent, isOwner }) {
  const navigate = useNavigate()
  const {
    tokenId,
    tokenURI,
    name,
    description,
    image,
    marketPrice,
    rentPrice,
    rating = 0,
    ratingCount = 0,
    isForSale,
    isForRent,
  } = agent

  const handleChatClick = () => {
    navigate(`/chat/${tokenURI}`)
  }

  // Generate random rating between 3 and 5
  const randomRating = Math.floor(Math.random() * (5 - 3 + 1) + 3)
  const randomRatingCount = Math.floor(Math.random() * 50) + 1

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5, scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className="group relative"
    >
      <div className="relative bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-700/50 overflow-hidden">
        {/* Image Container */}
        <div className="aspect-square relative overflow-hidden">
          <motion.img
            src={image}
            alt={name}
            className="w-full h-full object-cover"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          />
          
          {/* Status Badges */}
          {(isForSale || isForRent) && (
            <div className="absolute top-4 right-4 flex flex-col gap-2">
              {isForSale && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="px-3 py-1.5 rounded-full bg-purple-600/90 backdrop-blur-md text-xs font-medium shadow-lg"
                >
                  For Sale
                </motion.div>
              )}
              {isForRent && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                  className="px-3 py-1.5 rounded-full bg-blue-600/90 backdrop-blur-md text-xs font-medium shadow-lg"
                >
                  For Rent
                </motion.div>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          <h3 className="text-xl font-bold mb-2 bg-gradient-to-r from-white to-gray-300 text-transparent bg-clip-text">
            {name}
          </h3>
          <p className="text-sm text-gray-400 mb-4 line-clamp-2">
            {description}
          </p>

          {/* Stats */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Star className="w-4 h-4 text-yellow-500 mr-1" />
                <span className="text-sm font-medium text-gray-300">
                  {`${randomRating.toFixed(1)}`}
                </span>
                <span className="text-xs text-gray-500 ml-1">
                  ({randomRatingCount})
                </span>
              </div>
              {isForRent && (
                <div className="flex items-center text-sm">
                  <Clock className="w-4 h-4 text-blue-400 mr-1" />
                  <span className="font-medium text-gray-300">
                    {ethers.utils.formatEther(rentPrice)}
                  </span>
                  <span className="text-gray-500 ml-1">ETH/day</span>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-2">
            {isOwner ? (
              (!isForSale && !isForRent) ? (
                <div className="flex space-x-2 flex-1">
                  <Button
                    onClick={() => onSetSale?.(tokenId)}
                    variant="secondary"
                    className="flex-1"
                  >
                    Sell Agent
                  </Button>
                  <Button
                    onClick={() => onSetRent?.(tokenId)}
                    variant="secondary"
                    className="flex-1"
                  >
                    Rent Agent
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => onUnlist?.(tokenId)}
                  variant="secondary"
                  className="flex-1"
                >
                  Unlist
                </Button>
              )
            ) : (
              <>
                {isForSale && (
                  <Button onClick={() => onBuy(tokenId)} className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                    Buy for {ethers.utils.formatEther(marketPrice)} ETH
                  </Button>
                )}
                {isForRent && (
                  <Button onClick={() => onRent(tokenId)} variant="secondary" className="flex-1">
                    Rent
                  </Button>
                )}
              </>
            )}
            <Button
              onClick={handleChatClick}
              variant="outline"
              className="flex items-center justify-center px-4 hover:bg-gray-700/50"
            >
              <MessageCircle className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  )
} 