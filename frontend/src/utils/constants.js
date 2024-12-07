import AIgentXABI from '../contracts/AIgentX.json'

export const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS
export const INFURA_API_KEY = import.meta.env.VITE_INFURA_API_KEY
export const CHAIN_ID = import.meta.env.VITE_CHAIN_ID
export const NETWORK_NAME = import.meta.env.VITE_NETWORK_NAME
export const RPC_URL = import.meta.env.VITE_RPC_URL
export const EXPLORER_URL = import.meta.env.VITE_EXPLORER_URL

export const WALRUS_CONFIG = {
  publisher: import.meta.env.VITE_WALRUS_PUBLISHER || 'https://publisher.walrus-testnet.walrus.space',
  aggregator: import.meta.env.VITE_WALRUS_AGGREGATOR || 'https://aggregator.walrus-testnet.walrus.space'
}

export const STABILITY_API_KEY = import.meta.env.VITE_STABILITY_API_KEY
export const MEMORY_TRANSLATE_KEY = import.meta.env.VITE_MEMORY_TRANSLATE_KEY

export const CONTRACT_ABI = AIgentXABI

export const WALRUS_STORE_EPOCHS = 5