import { useState } from 'react';
import { Button } from './Button';
import { Modal } from './Modal';
import { ConnectWallet } from '@coinbase/onchainkit/wallet';
import { useWeb3 } from '../../context/Web3Context';
import { ChevronDown, LogOut } from 'lucide-react';

export function WalletSelector() {
  const [showModal, setShowModal] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedWallet, setSelectedWallet] = useState(null);
  const { account, connectWallet, disconnectWallet } = useWeb3();

  const handleWalletSelect = (walletType) => {
    setSelectedWallet(walletType);
    setShowModal(false);
    
    if (walletType === 'metamask') {
      connectWallet();
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
    setSelectedWallet(null);
    setShowDropdown(false);
  };

  // Show connected state with dropdown
  if (selectedWallet === 'metamask' && account) {
    return (
      <div className="relative">
        <Button
          onClick={() => setShowDropdown(!showDropdown)}
          variant="outline"
          className="flex items-center"
        >
          <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
          {`${account.slice(0, 6)}...${account.slice(-4)}`}
          <ChevronDown className="w-4 h-4 ml-2" />
        </Button>

        {showDropdown && (
          <div className="absolute right-0 mt-2 w-48 py-2 bg-gray-800 rounded-lg shadow-xl z-50">
            <button
              onClick={handleDisconnect}
              className="w-full px-4 py-2 text-left text-red-400 hover:bg-gray-700 flex items-center"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Disconnect
            </button>
          </div>
        )}
      </div>
    );
  }

  // If Coinbase wallet is selected
  if (selectedWallet === 'coinbase') {
    return (
      <ConnectWallet 
        buttonClassName="flex items-center px-4 py-2 rounded-lg font-medium border border-purple-600 text-purple-600 hover:bg-purple-50 focus:ring-purple-500"
        modalSize="compact"
        modalTheme={{
          background: 'bg-gray-900',
          text: 'text-white',
          border: 'border-gray-700'
        }}
      />
    );
  }

  return (
    <>
      <Button
        onClick={() => setShowModal(true)}
        variant="outline"
        className="flex items-center"
      >
        Connect Wallet
      </Button>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Select Wallet"
      >
        <div className="flex flex-col space-y-4 p-4">
          <Button
            onClick={() => handleWalletSelect('coinbase')}
            className="w-full flex items-center justify-center space-x-2"
          >
            <img 
              src="/coinbase-logo.png" 
              alt="Coinbase" 
              className="w-6 h-6"
            />
            <span>Coinbase Wallet</span>
          </Button>

          <Button
            onClick={() => handleWalletSelect('metamask')}
            className="w-full flex items-center justify-center space-x-2"
          >
            <img 
              src="/metamask-logo.png" 
              alt="MetaMask" 
              className="w-6 h-6"
            />
            <span>MetaMask</span>
          </Button>
        </div>
      </Modal>
    </>
  );
} 