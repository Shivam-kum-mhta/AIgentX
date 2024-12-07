import { createContext, useContext, useState, useEffect } from 'react'
import { ethers } from 'ethers'
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../utils/constants'

const Web3Context = createContext()

export function Web3Provider({ children }) {
  const [account, setAccount] = useState('')
  const [contract, setContract] = useState(null)
  const [provider, setProvider] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    initializeWeb3()
  }, [])

  const checkNetwork = async () => {
    if (window.ethereum) {
      const chainId = await window.ethereum.request({ method: 'eth_chainId' })
      const requiredChainId = `0x${Number(import.meta.env.VITE_CHAIN_ID).toString(16)}`
      
      if (chainId !== requiredChainId) {
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: requiredChainId }],
          })
        } catch (switchError) {
          if (switchError.code === 4902) {
            try {
              await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [{
                  chainId: requiredChainId,
                  chainName: import.meta.env.VITE_NETWORK_NAME,
                  rpcUrls: [import.meta.env.VITE_RPC_URL],
                  blockExplorerUrls: [import.meta.env.VITE_EXPLORER_URL],
                  nativeCurrency: {
                    name: 'ETH',
                    symbol: 'ETH',
                    decimals: 18
                  }
                }]
              })
            } catch (addError) {
              throw new Error('Please add the network to your wallet')
            }
          }
          throw new Error('Please switch to the correct network')
        }
      }
    }
  }

  const initializeWeb3 = async () => {
    try {
      await checkNetwork()
      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        console.log('the contract address', CONTRACT_ADDRESS)

        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer)

        console.log('the contract in web3 context', contract)
        console.log('Contract address:', CONTRACT_ADDRESS)
        console.log('Contract instance methods:', Object.keys(contract))
        
        setProvider(provider)
        setContract(contract)
        
        const accounts = await window.ethereum.request({ 
          method: 'eth_requestAccounts' 
        })
        setAccount(accounts[0])

        window.ethereum.on('accountsChanged', (accounts) => {
          setAccount(accounts[0])
        })
      }
    } catch (error) {
      console.error('Web3 initialization error:', error)
      throw error
    } finally {
      setLoading(false) 
    }
  }

  const connectWallet = async () => {
    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      })
      setAccount(accounts[0])
    } catch (error) {
      console.error('Error connecting wallet:', error)
    }
  }

  return (
    <Web3Context.Provider value={{
      account,
      contract,
      provider,
      loading,
      connectWallet
    }}>
      {children}
    </Web3Context.Provider>
  )
}

export function useWeb3() {
  return useContext(Web3Context)
} 