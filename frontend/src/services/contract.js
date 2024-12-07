import { ethers } from 'ethers'
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../utils/constants'

export function useContract() {
  const getContract = async () => {
    if (!window.ethereum) throw new Error('Please install MetaMask')
    
    await window.ethereum.request({ method: 'eth_requestAccounts' })
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner()
    return new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer)
  }

  // Functions from our smart contract
  const mintAgent = async (metadata) => {
    try {
      const contract = await getContract()
      const mintPrice = await contract.mintPrice()
      
      const tx = await contract.mintAgent(
        crypto.randomUUID(),
        metadata.name,
        metadata.description,
        metadata.tokenURI,
        { value: mintPrice }
      )

      const receipt = await tx.wait()
      const event = receipt.events?.find(e => e.event === 'AgentMinted')
      if (!event) throw new Error('Mint event not found')

      return {
        tx,
        tokenId: event.args.tokenId.toString()
      }
    } catch (error) {
      console.error('Error minting agent:', error)
      throw error
    }
  }

  const listAgent = async (tokenId, marketPrice, rentPrice, forSale, forRent) => {
    try {
      const contract = await getContract()
      const tx = await contract.listAgent(tokenId, marketPrice, rentPrice, forSale, forRent)
      await tx.wait()
      return tx
    } catch (error) {
      console.error('Error listing agent:', error)
      throw error
    }
  }

  const buyAgent = async (tokenId, price) => {
    try {
      const contract = await getContract()
      const tx = await contract.buyAgent(tokenId, { value: price })
      await tx.wait()
      return tx
    } catch (error) {
      console.error('Error buying agent:', error)
      throw error
    }
  }

  const rentAgent = async (tokenId, durationInDays, totalPrice) => {
    try {
      const contract = await getContract()
      const tx = await contract.rentAgent(tokenId, durationInDays, { value: totalPrice })
      await tx.wait()
      return tx
    } catch (error) {
      console.error('Error renting agent:', error)
      throw error
    }
  }

  const rateAgent = async (tokenId, rating) => {
    try {
      const contract = await getContract()
      const tx = await contract.rateAgent(tokenId, rating)
      await tx.wait()
      return tx
    } catch (error) {
      console.error('Error rating agent:', error)
      throw error
    }
  }

  const getAgentDetails = async (tokenId) => {
    try {
      const contract = await getContract()
      const details = await contract.getAgentDetails(tokenId)
      return {
        uuid: details.uuid,
        name: details.name,
        description: details.description,
        marketPrice: details.marketPrice,
        rentPrice: details.rentPrice,
        isForSale: details.isForSale,
        isForRent: details.isForRent,
        rating: details.rating.toNumber(),
        ratingCount: details.ratingCount.toNumber()
      }
    } catch (error) {
      console.error('Error getting agent details:', error)
      throw error
    }
  }

  const getAllAgents = async () => {
    try {
      const contract = await getContract()
      const totalSupply = await contract.totalSupply()
      const agents = []

      for (let i = 1; i <= totalSupply.toNumber(); i++) {
        try {
          const details = await contract.getAgentDetails(i)
          agents.push({
            tokenId: i,
            ...details,
            rating: details.rating.toNumber(),
            ratingCount: details.ratingCount.toNumber()
          })
        } catch (error) {
          console.warn(`Error fetching agent ${i}:`, error)
        }
      }

      return agents
    } catch (error) {
      console.error('Error getting all agents:', error)
      throw error
    }
  }

  return {
    mintAgent,
    listAgent,
    buyAgent,
    rentAgent,
    rateAgent,
    getAgentDetails,
    getAllAgents
  }
} 