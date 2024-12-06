import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ethers } from 'ethers';
import { uploadFile, uploadJSON, getIPFSUrl } from './services/storageService';
import { generateImage } from './services/stabilityService';
import NFTMarketplaceABI from './contracts/aigentx.json';
import './App.css';
import { useNFTs } from './hooks/useNFTs';
import axios from 'axios';

const CONTRACT_ADDRESS = '0x714824982e1B309E1cB9b2823b16a6813CdF48c3';
const MIN_GAS_LIMIT = 21000;
const MIN_PRICE = ethers.utils.parseEther('0.0001');

const getImageUrl = (ipfsUrl) => {
    if (!ipfsUrl) return '';
    
    // Try different gateways if the first one fails
    const gateways = getIPFSGateways();
    const cid = ipfsUrl.replace('ipfs://', '');
    
    const img = new Image();
    let currentGatewayIndex = 0;

    return new Promise((resolve) => {
        img.onload = () => resolve(img.src);
        img.onerror = () => {
            currentGatewayIndex++;
            if (currentGatewayIndex < gateways.length) {
                img.src = `${gateways[currentGatewayIndex]}/${cid}`;
            } else {
                resolve('https://via.placeholder.com/200?text=Image+Not+Found');
            }
        };
        img.src = `${gateways[0]}/${cid}`;
    });
};

function App() {
    const [account, setAccount] = useState('');
    const [contract, setContract] = useState(null);
    const [aiPrompt, setAiPrompt] = useState('');
    const [isGenerating, setIsGenerating] = useState(false);
    const [ownedNFTs, setOwnedNFTs] = useState([]);
    const [marketplaceNFTs, setMarketplaceNFTs] = useState([]);
    const [mintPrice, setMintPrice] = useState(0);
    const [isConnected, setIsConnected] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);
    const [isLoadingNFTs, setIsLoadingNFTs] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const observerTarget = useRef(null);
    const [nftImageUrls, setNftImageUrls] = useState({});
    const [isListening, setIsListening] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [selectedLanguage, setSelectedLanguage] = useState('en-US');
    
    const { 
        allNFTs, 
        marketplaceNFTs: graphMarketplaceNFTs, 
        getUserNFTs, 
        loading,
        hasMore,
        loadMore,
        resetPagination
    } = useNFTs();
    const { userNFTs, loading: loadingUserNFTs } = getUserNFTs(account);

    // Language options with ISO codes for translation
    const languages = [
        { code: 'en-US', iso: 'en', name: 'English (US)' },
        { code: 'es-ES', iso: 'es', name: 'Spanish' },
        { code: 'fr-FR', iso: 'fr', name: 'French' },
        { code: 'de-DE', iso: 'de', name: 'German' },
        { code: 'it-IT', iso: 'it', name: 'Italian' },
        { code: 'ja-JP', iso: 'ja', name: 'Japanese' },
        { code: 'ko-KR', iso: 'ko', name: 'Korean' },
        { code: 'zh-CN', iso: 'zh', name: 'Chinese (Simplified)' },
        { code: 'hi-IN', iso: 'hi', name: 'Hindi' },
        { code: 'ar-SA', iso: 'ar', name: 'Arabic' }
    ];
    
    useEffect(() => {
        if (!loading && !loadingUserNFTs && userNFTs && graphMarketplaceNFTs) {
            try {
                setIsLoadingNFTs(true);
                setOwnedNFTs(userNFTs);
                setMarketplaceNFTs(graphMarketplaceNFTs);
            } catch (error) {
                console.error("Error updating NFTs:", error);
            } finally {
                setIsLoadingNFTs(false);
            }
        }
    }, [loading, loadingUserNFTs, userNFTs, graphMarketplaceNFTs]);

    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting && hasMore && !isLoadingMore) {
                    handleLoadMore();
                }
            },
            { threshold: 0.5 }
        );

        if (observerTarget.current) {
            observer.observe(observerTarget.current);
        }

        return () => {
            if (observerTarget.current) {
                observer.unobserve(observerTarget.current);
            }
        };
    }, [hasMore, isLoadingMore]);

    const handleLoadMore = async () => {
        if (isLoadingMore) return;
        setIsLoadingMore(true);
        try {
            await loadMore();
        } finally {
            setIsLoadingMore(false);
        }
    };

    const loadNFTs = useCallback(async (marketplaceContract, accountAddress) => {
        try {
            const totalSupply = await marketplaceContract.totalSupply();
            let ownedNFTsArray = [];
            let marketplaceNFTsArray = [];

            for (let i = 1; i <= totalSupply; i++) {
                const tokenId = i.toString();
                try {
                    const owner = await marketplaceContract.ownerOf(tokenId);
                    const tokenURI = await marketplaceContract.tokenURI(tokenId);
                    const price = await marketplaceContract.tokenPrices(tokenId);

                    // Extract CID from tokenURI
                    const metadataCID = tokenURI.replace('ipfs://', '').trim();
                    let metadata;
                    
                    try {
                        // Try primary Walrus endpoint
                        const response = await axios.get(
                            `https://walrus-testnet-aggregator.stakin-nodes.com/v1/${metadataCID}`,
                            {
                                headers: {
                                    'Accept': 'application/json',
                                },
                                timeout: 5000
                            }
                        );
                        
                        // Validate metadata structure
                        metadata = response.data;
                        if (typeof metadata === 'string') {
                            try {
                                metadata = JSON.parse(metadata);
                            } catch (parseError) {
                                console.warn(`Invalid JSON metadata for token ${tokenId}`);
                                throw new Error('Invalid metadata format');
                            }
                        }
                        
                        // Ensure metadata has required fields
                        if (!metadata || !metadata.image) {
                            throw new Error('Invalid metadata structure');
                        }

                        // Ensure image field is a string
                        if (typeof metadata.image !== 'string') {
                            metadata.image = metadata.image.toString();
                        }

                    } catch (primaryError) {
                        console.warn(`Primary endpoint failed for token ${tokenId}, trying backup...`);
                        try {
                            // Try backup IPFS gateway
                            const backupResponse = await axios.get(
                                `https://ipfs.io/ipfs/${metadataCID}`,
                                {
                                    headers: {
                                        'Accept': 'application/json',
                                    },
                                    timeout: 5000
                                }
                            );
                            metadata = backupResponse.data;
                            
                            // Validate backup metadata
                            if (typeof metadata === 'string') {
                                metadata = JSON.parse(metadata);
                            }
                        } catch (backupError) {
                            console.warn(`Backup endpoint failed for token ${tokenId}, using fallback metadata`);
                            // Use fallback metadata if both endpoints fail
                            metadata = {
                                name: `NFT #${tokenId}`,
                                description: 'Metadata temporarily unavailable',
                                image: 'https://via.placeholder.com/400?text=Metadata+Loading'
                            };
                        }
                    }

                    const nft = {
                        id: tokenId,
                        owner: owner,
                        metadata: {
                            ...metadata,
                            image: metadata.image.startsWith('ipfs://') ? metadata.image : `ipfs://${metadata.image}`
                        },
                        price: price
                    };

                    if (owner.toLowerCase() === accountAddress.toLowerCase()) {
                        ownedNFTsArray.push(nft);
                    }

                    if (price.gt(0)) {
                        marketplaceNFTsArray.push(nft);
                    }
                } catch (error) {
                    console.warn(`Token ${tokenId} skipped:`, error.message);
                }
            }

            setOwnedNFTs(ownedNFTsArray);
            setMarketplaceNFTs(marketplaceNFTsArray);
        } catch (error) {
            console.error("Error loading NFTs:", error);
        }
    }, []);

    const connectWallet = useCallback(async () => {
        try {
            const { ethereum } = window;
            if (!ethereum) {
                alert('Please install MetaMask!');
                return;
            }

            const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
            const account = accounts[0];
            setAccount(account);
            setIsConnected(true);

            const provider = new ethers.providers.Web3Provider(ethereum);
            const signer = provider.getSigner();
            
            if (!Array.isArray(NFTMarketplaceABI.abi)) {
                throw new Error('Invalid ABI format');
            }

            const marketplaceContract = new ethers.Contract(
                CONTRACT_ADDRESS,
                NFTMarketplaceABI.abi,
                signer
            );

            setContract(marketplaceContract);

            if (marketplaceContract) {
                try {
                    const price = await marketplaceContract.mintPrice();
                    setMintPrice(price);
                    await loadNFTs(marketplaceContract, account);
                } catch (error) {
                    console.error("Error fetching contract data:", error);
                }
            }
        } catch (error) {
            console.error("Error connecting wallet:", error);
            alert(`Error connecting wallet: ${error.message}`);
        }
    }, [loadNFTs]);

    useEffect(() => {
        const darkModePreference = localStorage.getItem('darkMode') === 'true';
        setIsDarkMode(darkModePreference);
    }, []);

    useEffect(() => {
        document.body.classList.toggle('dark', isDarkMode);
        localStorage.setItem('darkMode', isDarkMode);
    }, [isDarkMode]);

    useEffect(() => {
        connectWallet();
    }, [connectWallet]);

    const disconnectWallet = useCallback(() => {
        setAccount('');
        setIsConnected(false);
        setContract(null);
        setOwnedNFTs([]);
        setMarketplaceNFTs([]);
    }, []);

    useEffect(() => {
        if (window.ethereum) {
            window.ethereum.on('accountsChanged', (accounts) => {
                if (accounts.length > 0) {
                    setAccount(accounts[0]);
                    setIsConnected(true);
                    connectWallet();
                } else {
                    disconnectWallet();
                }
            });
        }
        return () => {
            if (window.ethereum) {
                window.ethereum.removeAllListeners('accountsChanged');
            }
        };
    }, [connectWallet, disconnectWallet]);

    const generateAndMintNFT = async () => {
        if (!isConnected || !aiPrompt || !contract) {
            alert("Please ensure you're connected and have entered a prompt.");
            return;
        }
        try {
            setIsGenerating(true);
            
            // Step 1: Generate Image
            console.log('Generating image...');
            const generatedImage = await generateImage(aiPrompt);
            
            // Step 2: Upload image to Walrus
            console.log('Uploading image to Walrus...');
            let imageCID;
            try {
                imageCID = await uploadFile(generatedImage);
                console.log('Image uploaded successfully:', imageCID);
            } catch (uploadError) {
                console.error('Image upload failed:', uploadError);
                alert('Failed to upload image. Please try again.');
                return;
            }
            
            // Step 3: Create and upload metadata
            console.log('Creating metadata...');
            const metadata = {
                name: 'AI Generated NFT',
                description: aiPrompt,
                image: imageCID,
            };
            
            console.log('Uploading metadata to Walrus...');
            let metadataCID;
            try {
                metadataCID = await uploadJSON(metadata);
                console.log('Metadata uploaded successfully:', metadataCID);
            } catch (uploadError) {
                console.error('Metadata upload failed:', uploadError);
                alert('Failed to upload metadata. Please try again.');
                return;
            }
            
            // Step 4: Mint NFT
            console.log('Minting NFT...');
            const tx = await contract.mintAIGeneratedNFT(
                metadataCID,
                aiPrompt,
                'stable-diffusion-v1-6',
                { value: mintPrice }
            );
            
            console.log('Waiting for transaction confirmation...');
            await tx.wait();
            console.log('NFT minted successfully!');
            
            await loadNFTs(contract, account);
            setAiPrompt('');
            alert("AI NFT generated and minted successfully!");
        } catch (error) {
            console.error("Error in NFT generation process:", error);
            alert(error.message || "Error generating NFT. Please check console for details.");
        } finally {
            setIsGenerating(false);
        }
    };

    const setNFTPrice = async (tokenId, price) => {
        if (!isConnected || !contract) {
            alert("Please connect your wallet first");
            return;
        }
        try {
            const priceInWei = ethers.utils.parseEther(price);
            if (priceInWei.lt(MIN_PRICE)) {
                alert(`Minimum price is ${ethers.utils.formatEther(MIN_PRICE)} ETH`);
                return;
            }
            const tx = await contract.setTokenPrice(tokenId, priceInWei);
            await tx.wait();
            await loadNFTs(contract, account);
            alert("NFT price set successfully!");
        } catch (error) {
            console.error("Error setting NFT price:", error);
            alert("Error setting price. Please check console for details.");
        }
    };

    const buyNFT = async (tokenId, price) => {
        if (!isConnected || !contract) {
            alert("Please connect your wallet first");
            return;
        }
        try {
            const gasPrice = await contract.provider.getGasPrice();
            const gasLimit = await contract.estimateGas.buyToken(tokenId, { value: price });
            
            const tx = await contract.buyToken(tokenId, {
                value: price,
                gasLimit: Math.max(gasLimit.toNumber(), MIN_GAS_LIMIT),
                gasPrice: gasPrice
            });
            await tx.wait();
            await loadNFTs(contract, account);
            alert("NFT purchased successfully!");
        } catch (error) {
            console.error("Error buying NFT:", error);
            if (error.code === 'INSUFFICIENT_FUNDS') {
                alert("Insufficient funds. Please make sure you have enough ETH to cover the NFT price and gas fees.");
            } else {
                alert("Error buying NFT. Please check console for details.");
            }
        }
    };

    const renderLoadingIndicator = () => (
        <div className="w-full flex justify-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
    );

    const loadImageUrl = useCallback((nft) => {
        if (!nft?.metadata?.image) return;
        try {
            // Handle if the image is just a CID
            const imageValue = nft.metadata.image;
            const ipfsUrl = typeof imageValue === 'string' && imageValue.includes('/')
                ? imageValue
                : `ipfs://${imageValue}`;
            
            const url = getIPFSUrl(ipfsUrl);
            setNftImageUrls(prev => ({
                ...prev,
                [nft.id]: url
            }));
        } catch (error) {
            console.warn(`Failed to load image for NFT ${nft.id}:`, error);
            setNftImageUrls(prev => ({
                ...prev,
                [nft.id]: 'https://via.placeholder.com/200?text=NFT+Image+Not+Found'
            }));
        }
    }, []);

    useEffect(() => {
        if (ownedNFTs) {
            ownedNFTs.forEach(loadImageUrl);
        }
        if (marketplaceNFTs) {
            marketplaceNFTs.forEach(loadImageUrl);
        }
    }, [ownedNFTs, marketplaceNFTs, loadImageUrl]);

    const renderNFTImage = (nft) => (
        <img
            src={nftImageUrls[nft.id] || 'https://via.placeholder.com/200?text=Loading...'}
            alt={`NFT ${nft.id}`}
            className="nft-image"
            onError={(e) => {
                e.target.src = 'https://via.placeholder.com/200?text=NFT+Image+Not+Found';
            }}
        />
    );

    // Translate text using MyMemory API
    const translateText = async (text, sourceLang) => {
        try {
            const response = await fetch(
                `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|en&key=3b4ad687568b5bb8a34e`
            );
            const data = await response.json();
            
            if (data.responseStatus === 200 && data.responseData?.translatedText) {
                return data.responseData.translatedText;
            } else {
                throw new Error(data.responseDetails || 'Translation failed');
            }
        } catch (error) {
            console.error('Translation error:', error);
            throw error;
        }
    };
    
    // Voice recognition setup with language support
    const startListening = () => {
        if (!('webkitSpeechRecognition' in window)) {
            setErrorMessage('Speech recognition is not supported in this browser. Please use Chrome.');
            return;
        }

        const recognition = new webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = selectedLanguage;

        recognition.onstart = () => {
            setIsListening(true);
            setErrorMessage('');
        };

        recognition.onresult = async (event) => {
            const transcript = event.results[0][0].transcript;
            
            try {
                // If not in English, translate to English
                if (selectedLanguage !== 'en-US') {
                    const sourceLang = languages.find(l => l.code === selectedLanguage)?.iso;
                    if (!sourceLang) {
                        throw new Error('Language not supported');
                    }

                    const translatedText = await translateText(transcript, sourceLang);
                    setAiPrompt((prev) => prev + ' ' + translatedText);
                } else {
                    setAiPrompt((prev) => prev + ' ' + transcript);
                }
            } catch (error) {
                console.error('Translation error:', error);
                // Fallback to original transcript if translation fails
                setAiPrompt((prev) => prev + ' ' + transcript);
                setErrorMessage('Translation failed, using original text');
            }
        };

        recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            setErrorMessage('Error recording voice. Please try again.');
            setIsListening(false);
        };

        recognition.onend = () => {
            setIsListening(false);
        };

        recognition.start();
    };

    if (loading || loadingUserNFTs || isLoadingNFTs) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-xl">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
                    Loading NFTs...
                </div>
            </div>
        );
    }

    return (
        <div className={`app ${isDarkMode ? 'dark' : ''}`}>
            <div className="container">
                <header className="header">
                    <h1>AI NFT Marketplace</h1>
                    <p>Connected Account: {account || 'Not connected'}</p>
                    {!isConnected ? (
                        <button className="btn btn-primary" onClick={connectWallet}>
                            Connect Wallet
                        </button>
                    ) : (
                        <button className="btn btn-secondary" onClick={disconnectWallet}>
                            Disconnect Wallet
                        </button>
                    )}
                    <button className="btn btn-toggle" onClick={() => setIsDarkMode(!isDarkMode)}>
                        {isDarkMode ? '☀️' : '🌙'}
                    </button>
                </header>

                <div className="grid">
                    <div className="card">
                        <h2>Generate AI NFT</h2>
                        <div className="input-container">
                            <div className="input-group">
                                <select
                                    value={selectedLanguage}
                                    onChange={(e) => setSelectedLanguage(e.target.value)}
                                    className="language-select"
                                    disabled={isListening || isGenerating}
                                >
                                    {languages.map((lang) => (
                                        <option key={lang.code} value={lang.code}>
                                            {lang.name}
                                        </option>
                                    ))}
                                </select>
                                <textarea
                                    value={aiPrompt}
                                    onChange={(e) => setAiPrompt(e.target.value)}
                                    className="textarea"
                                    placeholder="Enter your prompt for AI generation..."
                                />
                            </div>
                            <button
                                onClick={startListening}
                                className={`btn btn-voice ${isListening ? 'listening' : ''}`}
                                disabled={isGenerating || isListening}
                                title={`Click to use voice input (${languages.find(l => l.code === selectedLanguage)?.name})`}
                            >
                                {isListening ? '🎤 Recording...' : '🎤'}
                            </button>
                        </div>
                        {errorMessage && <p className="error-message">{errorMessage}</p>}
                        <button
                            onClick={generateAndMintNFT}
                            className="btn btn-primary"
                            disabled={!isConnected || !aiPrompt || isGenerating}
                        >
                            {isGenerating ? 'Generating...' : 'Generate and Mint NFT'}
                        </button>
                    </div>
                </div>

                <div className="nft-section">
                    <h2>Your NFTs ({ownedNFTs?.length || 0})</h2>
                    <div className="nft-grid">
                        {ownedNFTs && ownedNFTs.length > 0 ? (
                            ownedNFTs.map((nft) => (
                                <div key={nft.id} className="nft-card">
                                    {renderNFTImage(nft)}
                                    <p>Token ID: {nft.id}</p>
                                    <p>Description: {nft.metadata?.description || 'No description'}</p>
                                    <input
                                        type="number"
                                        id={`price-${nft.id}`}
                                        placeholder="Set price (ETH)"
                                        className="input"
                                        step="0.01"
                                    />
                                    <button
                                        onClick={() => {
                                            const priceInput = document.getElementById(`price-${nft.id}`);
                                            if (priceInput && priceInput.value) {
                                                setNFTPrice(nft.id, priceInput.value);
                                            } else {
                                                alert("Please enter a valid price");
                                            }
                                        }}
                                        className="btn btn-secondary"
                                        disabled={!isConnected}
                                    >
                                        Set Price
                                    </button>
                                </div>
                            ))
                        ) : (
                            <p>No NFTs owned yet</p>
                        )}
                    </div>
                </div>

                <div className="nft-section">
                    <h2>Marketplace ({marketplaceNFTs?.length || 0})</h2>
                    <div className="nft-grid">
                        {marketplaceNFTs && marketplaceNFTs.length > 0 ? (
                            marketplaceNFTs.map((nft) => (
                                <div key={nft.id} className="nft-card">
                                    {renderNFTImage(nft)}
                                    <p>Token ID: {nft.id}</p>
                                    <p>Description: {nft.metadata?.description || 'No description'}</p>
                                    <p>Price: {ethers.utils.formatEther(nft.price)} ETH</p>
                                    {nft.owner.toLowerCase() === account.toLowerCase() ? (
                                        <button
                                            className="btn btn-disabled"
                                            disabled
                                        >
                                            Your NFT
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => buyNFT(nft.id, nft.price)}
                                            className="btn btn-primary"
                                            disabled={!isConnected}
                                        >
                                            Buy NFT
                                        </button>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p>No NFTs in marketplace</p>
                        )}
                    </div>
                    <div ref={observerTarget}>
                        {(hasMore && !loading) && renderLoadingIndicator()}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;