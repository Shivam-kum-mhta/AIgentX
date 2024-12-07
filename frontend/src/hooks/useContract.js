import { useWeb3 } from '../context/Web3Context'
import { ethers } from 'ethers'

export function useContract() {
  const { contract } = useWeb3()
  console.log('the contract in use contract hook', contract)
  const mintAgent = async (uuid, name, description, tokenURI) => {
    try {
      const mintPrice = await contract.mintPrice()
      const tx = await contract.mintAgent(
        uuid,
        name, 
        description,
        tokenURI,
        { 
          value: mintPrice,
          gasLimit: 500000
        }
      )
      await tx.wait()
      return tx
    } catch (error) {
      console.error('Error minting agent:', error)
      if (error.code === 'INSUFFICIENT_FUNDS') {
        throw new Error('Insufficient funds to mint')
      } else if (error.code === 'UNPREDICTABLE_GAS_LIMIT') {
        throw new Error('Transaction may fail - try increasing gas limit')
      }
      throw error
    }
  }

  const listAgent = async (tokenId, marketPrice, rentPrice, forSale, forRent) => {
    try {
      const tx = await contract.listAgent(
        tokenId,
        ethers.utils.parseEther(marketPrice.toString()),
        ethers.utils.parseEther(rentPrice.toString()),
        forSale,
        forRent
      )
      await tx.wait()
      return tx
    } catch (error) {
      console.error('Error listing agent:', error)
      throw error
    }
  }

  const buyAgent = async (tokenId, price) => {
    try {
      const tx = await contract.buyAgent(tokenId, {
        value: ethers.utils.parseEther(price.toString())
      })
      await tx.wait()
      return tx
    } catch (error) {
      console.error('Error buying agent:', error)
      throw error
    }
  }

  return {
    contract, //contract is the instance of the contract 
    mintAgent,
    listAgent, 
    buyAgent
  }
} 