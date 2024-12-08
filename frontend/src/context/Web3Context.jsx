import { createContext, useContext, useState } from 'react'
import { ethers } from 'ethers'
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../utils/constants'

const Web3Context = createContext()

export function Web3Provider({ children }) {
  const [account, setAccount] = useState('')
  const [contract, setContract] = useState(null)
  const [provider, setProvider] = useState(null)
  const [loading, setLoading] = useState(false)

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

  const connectWallet = async () => {
    try {
      setLoading(true)
      await checkNetwork()

      if (window.ethereum) {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer)

        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts'
        })

        setProvider(provider)
        setContract(contract)
        setAccount(accounts[0])

        // Listen for account changes
        window.ethereum.on('accountsChanged', (accounts) => {
          if (accounts.length === 0) {
            disconnectWallet()
          } else {
            setAccount(accounts[0])
          }
        })
      }
    } catch (error) {
      console.error('Error connecting wallet:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const disconnectWallet = () => {
    setAccount('')
    setContract(null)
    setProvider(null)
    // Remove any event listeners
    if (window.ethereum) {
      window.ethereum.removeAllListeners('accountsChanged')
    }
  }

  return (
    <Web3Context.Provider value={{
      account,
      contract,
      provider,
      loading,
      connectWallet,
      disconnectWallet
    }}>
      {children}
    </Web3Context.Provider>
  )
}

export function useWeb3() {
  return useContext(Web3Context)
} 