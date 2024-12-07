import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useContract } from '../../services/contract'
import { useWalrus } from '../../services/walrus'
import { useStability } from '../../services/stability'
import { Button } from '../shared/Button'
import { Input } from '../shared/Input'
import { ImageGenerator } from './ImageGenerator'
import { toast } from 'sonner'
import { v4 as uuidv4 } from 'uuid'


export function MintForm({ onSuccess }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [image, setImage] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  
  const { mintAgent } = useContract()
  const { uploadToWalrus } = useWalrus()
  const { generateImage } = useStability()

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
      // Generate UUID before minting for later use
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

  return (
    <form onSubmit={handleMint} className="space-y-6">
      <Input
        label="Agent Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      
      <Input
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        multiline
        required
      />

      <ImageGenerator
        description={description}
        onGenerate={setImage}
      />

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