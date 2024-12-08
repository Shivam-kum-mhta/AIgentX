import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useContract } from '../../services/contract'
import { useWalrus } from '../../services/walrus'
import { useStability } from '../../services/stability'
import { Button } from '../shared/Button'
import { Input } from '../shared/Input'
import { VoiceInput } from '../shared/VoiceInput'
import { toast } from 'sonner'
import { v4 as uuidv4 } from 'uuid'
import { useWeb3 } from '../../context/Web3Context'
import { motion } from 'framer-motion'
import { Sparkles, Globe2, Wand2, Brain } from 'lucide-react'

const LANGUAGES = [
  { code: 'en', name: 'English', icon: '🇺🇸' },
  { code: 'es', name: 'Spanish', icon: '🇪🇸' },
  { code: 'fr', name: 'French', icon: '🇫🇷' },
  { code: 'de', name: 'German', icon: '🇩🇪' },
  { code: 'it', name: 'Italian', icon: '🇮🇹' },
  { code: 'ja', name: 'Japanese', icon: '🇯🇵' },
  { code: 'ko', name: 'Korean', icon: '🇰🇷' },
  { code: 'zh', name: 'Chinese', icon: '🇨🇳' },
  { code: 'hi', name: 'Hindi', icon: '🇮🇳' }
]

const transliterate = async (text, language) => {
  try {
    const response = await fetch(`https://inputtools.google.com/request?text=${encodeURIComponent(text)}&itc=${language}-t-i0-und&num=1`)
    const data = await response.json()
    
    if (data[0] === 'SUCCESS') {
      return data[1][0][1][0] // Get the first suggestion
    }
    return text
  } catch (error) {
    console.error('Transliteration error:', error)
    return text
  }
}

const translateText = async (text, fromLang, toLang = 'en') => {
  try {
    // First try to transliterate if needed
    let nativeText = text
    if (fromLang === 'hi') {
      nativeText = await transliterate(text, 'hi')
    }

    // Then translate to English
    const response = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(nativeText)}&langpair=${fromLang}|${toLang}&key=3b4ad687568b5bb8a34e`
    )
    const data = await response.json()
    
    if (data.responseStatus === 200) {
      return {
        english: data.responseData.translatedText,
        native: nativeText // Use the transliterated text
      }
    } else {
      throw new Error(data.responseMessage || 'Translation failed')
    }
  } catch (error) {
    console.error('Translation error:', error)
    toast.error('Failed to translate text')
    return {
      english: text,
      native: text
    }
  }
}

// Language codes for transliteration
const TRANSLITERATION_CODES = {
  hi: 'hi-t-i0-und',
  // Add more languages that support transliteration
}

export function MintForm({ onSuccess }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('') // This will store English translation
  const [nativeInput, setNativeInput] = useState('') // This will store native language input
  const [image, setImage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState('en')
  
  const { mintAgent} = useContract()
  const { uploadToWalrus } = useWalrus()
  const { generateImage } = useStability()
  const { account } = useWeb3()

  console.log('account from the backend is here', account)
  const optimizeImage = async (imageData) => {
    return new Promise((resolve) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')

        const targetWidth = 512
        const targetHeight = 512

        canvas.width = targetWidth
        canvas.height = targetHeight

        ctx.drawImage(img, 0, 0, targetWidth, targetHeight)

        resolve(canvas.toDataURL('image/jpeg', 0.7))
      }
      img.src = imageData
    })
  }

  const handleMint = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      let imageData
      try {
        imageData = image || await generateImage(description)
        imageData = await optimizeImage(imageData)
      } catch (imageError) {
        console.error('Image error:', imageError)
        toast.error('Failed to process image. Using placeholder.')
        imageData = 'https://via.placeholder.com/512x512?text=AI+Agent'
      }

      const metadata = {
        name: name.trim(),
        description: description.trim(),
        image: imageData,
        attributes: []
      }

      const blobId = await uploadToWalrus(metadata)
      console.log('the blob id after uploading to walrus', blobId)
      
      // Create agent on backend before minting
      const agentResponse = await fetch(`http://localhost:8000/create-agent/${account}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'http://localhost:3001' // this is the frontend port number properly
        },
        body: JSON.stringify({
          prompt: description,
          nftHash: blobId
        })
      })

      if (!agentResponse.ok) {
        const errorData = await agentResponse.json()
        throw new Error(errorData.detail || 'Failed to create agent')
      }

      const agentData = await agentResponse.json()
      console.log('Agent created with wallet:', agentData.walletAddress)
      // Alert the user with the new wallet address
      toast.success(`Agent created with wallet: ${agentData.walletAddress}`, {
        duration: 5000,
        position: 'bottom-center'
      })

      // Generate UUID and mint NFT
      const agentUUID = uuidv4()
      console.log('Generated UUID:', agentUUID)
      
      const { tx, tokenId } = await mintAgent({
        uuid: agentUUID,
        name,
        description,
        tokenURI: blobId
      })
      console.log('the token id after minting', tokenId)
      console.log('the tx', tx)

      toast.success('Agent minted successfully!')
      onSuccess?.(tx)
      navigate(`/my-agents`)

    } catch (error) {
      console.error('Error minting:', error)
      if (error.code === 4001) {
        toast.error('Transaction rejected by user')
      } else if (error.message.includes('insufficient funds')) {
        toast.error('Insufficient funds to mint')
      } else {
        toast.error(error.message || 'Failed to mint agent')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleLanguageChange = async (e) => {
    const newLang = e.target.value
    setSelectedLanguage(newLang)
    
    if (description && newLang !== 'en') {
      setNativeInput('') // Clear native input when switching languages
    }
  }

  const handleNativeInputChange = async (e) => {
    const newText = e.target.value
    setNativeInput(newText)
    
    if (selectedLanguage !== 'en' && newText) {
      const { english, native } = await translateText(newText, selectedLanguage)
      setNativeInput(native) // This will now be in native script
      setDescription(english) // This will be in English
    } else {
      setDescription(newText)
    }
  }

  const handleVoiceInput = async (transcript) => {
    if (selectedLanguage !== 'en') {
      const { english, native } = await translateText(transcript, selectedLanguage)
      setNativeInput(native) // This will now be in native script
      setDescription(english) // This will be in English
    } else {
      setNativeInput('')
      setDescription(transcript)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        {/* Form Container */}
        <div className="relative space-card p-8">
          {/* Animated gradient border */}
          <div className="absolute inset-0 rounded-2xl overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/20 to-transparent -translate-x-full animate-shimmer" />
          </div>

          <form onSubmit={handleMint} className="space-y-8">
            {/* Name Input */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-2"
            >
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-300">
                <Brain className="w-4 h-4 text-purple-400" />
                <span>Agent Name</span>
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your agent's name"
                className="space-input"
              />
            </motion.div>

            {/* Language Selector */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-4"
            >
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-300">
                <Globe2 className="w-4 h-4 text-purple-400" />
                <span>Select Language</span>
              </label>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                {LANGUAGES.map(lang => (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => handleLanguageChange({ target: { value: lang.code } })}
                    className={`flex items-center space-x-2 p-3 rounded-xl transition-all ${
                      selectedLanguage === lang.code
                        ? 'bg-purple-500/10 border border-purple-500/50'
                        : 'space-button hover:bg-purple-500/5'
                    }`}
                  >
                    <span className="text-lg">{lang.icon}</span>
                    <span className="text-sm">{lang.name}</span>
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Description Input */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="space-y-4"
            >
              {selectedLanguage !== 'en' ? (
                <>
                  <div className="relative space-y-2">
                    <label className="flex items-center space-x-2 text-sm font-medium text-gray-300">
                      <Wand2 className="w-4 h-4 text-purple-400" />
                      <span>Description ({LANGUAGES.find(l => l.code === selectedLanguage)?.name})</span>
                    </label>
                    <div className="relative">
                      <Input
                        value={nativeInput}
                        onChange={handleNativeInputChange}
                        multiline
                        placeholder={`Write in ${LANGUAGES.find(l => l.code === selectedLanguage)?.name}`}
                        className="space-input pr-12"
                      />
                      <VoiceInput 
                        onTranscript={handleVoiceInput}
                        className="absolute right-3 top-1/2 -translate-y-1/2"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-300">English Translation</label>
                    <Input
                      value={description}
                      readOnly
                      multiline
                      className="space-input bg-gray-900/30"
                    />
                  </div>
                </>
              ) : (
                <div className="relative space-y-2">
                  <label className="flex items-center space-x-2 text-sm font-medium text-gray-300">
                    <Wand2 className="w-4 h-4 text-purple-400" />
                    <span>Description</span>
                  </label>
                  <div className="relative">
                    <Input
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      multiline
                      placeholder="Describe your agent's capabilities..."
                      className="space-input pr-12"
                    />
                    <VoiceInput 
                      onTranscript={handleVoiceInput}
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                    />
                  </div>
                </div>
              )}
            </motion.div>

            {/* Submit Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Button
                type="submit"
                loading={loading}
                disabled={!name || !description}
                className="w-full space-button bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 group"
              >
                <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
                Create Agent
              </Button>
            </motion.div>
          </form>
        </div>
      </motion.div>
    </div>
  )
} 
