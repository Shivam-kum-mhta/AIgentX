import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useContract } from '../../services/contract'
import { useWalrus } from '../../services/walrus'
import { useStability } from '../../services/stability'
import { Button } from '../shared/Button'
import { Input } from '../shared/Input'
import { ImageGenerator } from './ImageGenerator'
import { VoiceInput } from '../shared/VoiceInput'
import { toast } from 'sonner'
import { v4 as uuidv4 } from 'uuid'
import { useWeb3 } from '../../context/Web3Context'

// Add supported languages
const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'zh', name: 'Chinese' },
  { code: 'hi', name: 'Hindi' }
]

export function MintForm({ onSuccess }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [image, setImage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [selectedLanguage, setSelectedLanguage] = useState('en')
  const [translatedDescription, setTranslatedDescription] = useState('')
  
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
      navigate(`/agent/${tokenId}`)

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

  const translateText = async (text, targetLang) => {
    try {
      const langCode = targetLang.split('-')[0]
      const sourceLang = 'en'
      const response = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${langCode}&key=3b4ad687568b5bb8a34e`
      )
      const data = await response.json()
      
      if (data.responseStatus === 200) {
        return data.responseData.translatedText
      } else {
        throw new Error(data.responseMessage || 'Translation failed')
      }
    } catch (error) {
      console.error('Translation error:', error)
      toast.error('Failed to translate text')
      return text // Return original text if translation fails
    }
  }

  const handleLanguageChange = async (e) => {
    const newLang = e.target.value
    setSelectedLanguage(newLang)
    
    if (description && newLang !== 'en') {
      const translated = await translateText(description, newLang)
      setTranslatedDescription(translated)
    } else {
      setTranslatedDescription('')
    }
  }

  const handleVoiceInput = async (transcript) => {
    setDescription(transcript)
    if (selectedLanguage !== 'en') {
      const translated = await translateText(transcript, selectedLanguage)
      setTranslatedDescription(translated)
    }
  }

  return (
    <form onSubmit={handleMint} className="space-y-6">
      <Input
        label="Agent Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      
      <div className="space-y-2">
        <select
          value={selectedLanguage}
          onChange={handleLanguageChange}
          className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
        >
          {LANGUAGES.map(lang => (
            <option key={lang.code} value={lang.code}>
              {lang.name}
            </option>
          ))}
        </select>

        <Input
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          multiline
          required
        />
        
        {translatedDescription && (
          <Input
            label="Translated Description"
            value={translatedDescription}
            readOnly
            multiline
          />
        )}

        <VoiceInput 
          onTranscript={handleVoiceInput}
          className="ml-2" 
        />
      </div>

      <Button
        type="submit"
        loading={loading}
        disabled={!name || !description}
      >
        Mint Agent
      </Button>
    </form>
  )
} 
