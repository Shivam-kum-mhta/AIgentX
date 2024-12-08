import { useState } from 'react'
import { Button } from './Button'
import { Modal } from './Modal'
import { useWeb3 } from '../../context/Web3Context'
import { Wallet, ChevronDown, LogOut } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export function WalletSelector() {
  const [showDropdown, setShowDropdown] = useState(false)
  const { account, connectWallet, disconnectWallet } = useWeb3()

  if (account) {
    return (
      <div className="relative">
        <Button
          onClick={() => setShowDropdown(!showDropdown)}
          variant="outline"
          className="flex items-center space-x-2"
        >
          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
          <span>{`${account.slice(0, 6)}...${account.slice(-4)}`}</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
        </Button>

        <AnimatePresence>
          {showDropdown && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-30"
                onClick={() => setShowDropdown(false)}
              />
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 mt-2 w-48 py-2 bg-gray-800 rounded-xl border border-gray-700 shadow-xl z-40"
              >
                <button
                  onClick={() => {
                    disconnectWallet()
                    setShowDropdown(false)
                  }}
                  className="w-full px-4 py-2 text-left text-red-400 hover:bg-gray-700/50 flex items-center space-x-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Disconnect</span>
                </button>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <Button
      onClick={connectWallet}
      variant="outline"
      className="flex items-center space-x-2"
    >
      <Wallet className="w-4 h-4" />
      <span>Connect Wallet</span>
    </Button>
  )
} 