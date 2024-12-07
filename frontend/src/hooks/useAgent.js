import { useState, useEffect } from 'react'
import { useContract } from '../services/contract'
import { useWalrus } from '../services/walrus'

export function useAgent(tokenId) {
  const [agent, setAgent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const { getContract } = useContract()
  const { getFromWalrus } = useWalrus()

  useEffect(() => {
    const loadAgent = async () => {
      try {
        const contract = await getContract()
        
        // Get on-chain data
        const details = await contract.getAgentDetails(tokenId)
        const [rating, ratingCount] = await contract.getAgentRating(tokenId)
        
        // Get metadata from Walrus
        const metadata = await getFromWalrus(details.tokenURI)

        setAgent({
          tokenId,
          uuid: details.uuid,
          name: details.name,
          description: details.description,
          image: metadata.image,
          marketPrice: details.marketPrice,
          rentPrice: details.rentPrice,
          isForSale: details.isForSale,
          isForRent: details.isForRent,
          rating: rating.toNumber(),
          ratingCount: ratingCount.toNumber()
        })
      } catch (error) {
        console.error('Error loading agent:', error)
        setError(error)
      } finally {
        setLoading(false)
      }
    }

    if (tokenId) {
      loadAgent()
    }
  }, [tokenId])

  return { agent, loading, error }
} 