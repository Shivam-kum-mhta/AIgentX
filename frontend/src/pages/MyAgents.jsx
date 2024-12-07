import { useState, useEffect } from 'react'
import { useContract } from '../hooks/useContract'
import { useWeb3 } from '../context/Web3Context'
import { AgentGrid } from '../components/marketplace/AgentGrid'
import { useWalrus } from '../services/walrus'
import { toast } from 'sonner'
import { Button } from '../components/shared/Button'
import { ListAgent } from '../components/marketplace/ListAgent'
import { Modal } from '../components/shared/Modal'

export function MyAgents() {
  const [agents, setAgents] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedAgent, setSelectedAgent] = useState(null)
  const [showListModal, setShowListModal] = useState(false)
  const { contract } = useContract()
  const { account } = useWeb3()
  const { getFromWalrus } = useWalrus()

  useEffect(() => {
    if (account && contract) {
        console.log('account', account)
        console.log('contract', contract)
      loadMyAgents()
    }
  }, [account, contract])

  const loadMyAgents = async () => {
    try {
      if (!contract || !account) {
        console.error('Contract or account not initialized')
        return
      }

      const balance = await contract.balanceOf(account)
      console.log('the balance', balance.toString())
      const agentPromises = []

      for (let i = 0; i < balance; i++) {
        const tokenId = await contract.tokenOfOwnerByIndex(account, i)
        console.log('the token id', tokenId)
        
        // Get agent details and tokenURI in parallel
        const [agentDetails, tokenURI] = await Promise.all([
          contract.getAgentDetails(tokenId),
          contract.tokenURI(tokenId)
        ])
        
        console.log('the agent details', agentDetails)
        console.log('the token URI', tokenURI)

        // Get metadata using the tokenURI from tokenURI function
        const metadata = await getFromWalrus(tokenURI)
        
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
      }

      const agents = await Promise.all(agentPromises)
      setAgents(agents)
      console.log('the agents', agents)
    } catch (error) {
      console.error('Error loading agents:', error)
      toast.error('Failed to load your agents')
    } finally {
      setLoading(false)
    }
  }

  const handleList = (agent) => {
    setSelectedAgent(agent)
    setShowListModal(true)
  }

  const handleListSubmit = async (values) => {
    try {
      await contract.listAgent(
        selectedAgent.tokenId,
        values.marketPrice,
        values.rentPrice,
        values.isForSale,
        values.isForRent
      )
      toast.success('Agent listed successfully!')
      setShowListModal(false)
      loadMyAgents()
    } catch (error) {
      console.error('Error listing agent:', error)
      toast.error('Failed to list agent')
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">My Agents</h1>
        <Button onClick={() => navigate('/mint')}>
          Create New Agent
        </Button>
      </div>

      {agents.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-400">You don't own any agents yet.</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => navigate('/marketplace')}
          >
            Explore Marketplace
          </Button>
        </div>
      ) : (
        <AgentGrid
          agents={agents}
          onList={handleList}
        />
      )}

      <Modal
        isOpen={showListModal}
        onClose={() => setShowListModal(false)}
        title="List Agent"
      >
        <ListAgent
          agent={selectedAgent}
          onSubmit={handleListSubmit}
          onCancel={() => setShowListModal(false)}
        />
      </Modal>
    </div>
  )
} 