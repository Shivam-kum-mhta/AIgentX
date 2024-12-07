import { useState, useEffect } from 'react'
import { useContract } from '../hooks/useContract'

import { AgentGrid } from '../components/marketplace/AgentGrid'
import { useWalrus } from '../services/walrus'
import { toast } from 'sonner'
import { useWeb3 } from '../context/Web3Context'

export function Marketplace() {
  const [agents, setAgents] = useState([])
  const [loading, setLoading] = useState(true)
  const { contract } = useContract()
  const { account } = useWeb3()
  const { getFromWalrus } = useWalrus()

  useEffect(() => {
    if (contract && account) {
      console.log('i am in the marketplace', account)
      console.log('contract', contract)
      loadAgents()
    }
  }, [contract, account])

  const loadAgents = async () => {
    try {
      if (!contract) {
        console.error('Contract not initialized')
        return
      }

      console.log('Starting to load agents...')
      const totalSupply = await contract.totalSupply()
      console.log('Total supply:', totalSupply.toString())
      
      if (totalSupply.toNumber() === 0) {
        console.log('No agents minted yet')
        setAgents([])
        setLoading(false)
        return
      }

      const agentPromises = []

      for (let i = 0; i < totalSupply; i++) {
        try {
          const tokenId = await contract.tokenByIndex(i)
          console.log('Processing token ID:', tokenId.toString())
          
          // Get agent details and tokenURI in parallel
          const [agentDetails, tokenURI] = await Promise.all([
            contract.getAgentDetails(tokenId),
            contract.tokenURI(tokenId)
          ])
          
          
          console.log('Agent details:', agentDetails)
          console.log('Token URI:', tokenURI)

          // Get metadata using the tokenURI
          const metadata = await getFromWalrus(tokenURI)
          console.log('Metadata:', metadata)
          
          agentPromises.push({
            tokenId: tokenId,
            tokenURI: tokenURI,
            name: agentDetails.name,
            description: agentDetails.description,
            image: metadata.image,
            marketPrice: agentDetails.marketPrice,
            rentPrice: agentDetails.rentPrice,
            rating: agentDetails.rating,
            ratingCount: agentDetails.ratingCount,
            isForSale: agentDetails.isForSale,
            isForRent: agentDetails.isForRent
          })
        } catch (error) {
          console.error(`Error processing token ${i}:`, error)
          // Continue with next token even if one fails
          continue
        }
      }

      const agents = await Promise.all(agentPromises)
      console.log('Loaded agents:', agents)
      setAgents(agents)
    } catch (error) {
      console.error('Error loading agents:', error)
      toast.error('Failed to load agents')
    } finally {
      setLoading(false)
    }
  }

  const handleBuy = async (tokenId) => {
    try {
      const agent = agents.find(a => a.tokenId.toString() === tokenId.toString())
      if (!agent) throw new Error('Agent not found')
      
      const tx = await contract.buyAgent(tokenId, {
        value: agent.marketPrice
      })
      await tx.wait()
      
      toast.success('Agent purchased successfully!')
      loadAgents()
    } catch (error) {
      console.error('Error buying agent:', error)
      toast.error('Failed to buy agent')
    }
  }

  const handleRent = async (tokenId, days) => {
    try {
      const agent = agents.find(a => a.tokenId.toString() === tokenId.toString())
      if (!agent) throw new Error('Agent not found')
      
      const totalPrice = agent.rentPrice.mul(days)
      const tx = await contract.rentAgent(tokenId, days, {
        value: totalPrice
      })
      await tx.wait()
      
      toast.success('Agent rented successfully!')
      loadAgents()
    } catch (error) {
      console.error('Error renting agent:', error)
      toast.error('Failed to rent agent')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p>Loading marketplace...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8">Marketplace</h1>
      {agents.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400">No agents available in the marketplace.</p>
        </div>
      ) : (
        <AgentGrid
          agents={agents}
          onBuy={handleBuy}
          onRent={handleRent}
        />
      )}
    </div>
  )
} 