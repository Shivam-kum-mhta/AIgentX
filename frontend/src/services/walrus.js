import axios from 'axios'
import { WALRUS_CONFIG } from '../utils/constants'

export function useWalrus() {
  const uploadToWalrus = async (metadata) => {
    try {
      // Validate metadata
      console.log('the metadata', metadata)
      if (!metadata.name || !metadata.description || !metadata.image) {
        throw new Error('Invalid metadata format')
      }

      // Convert base64 image to blob with size check
      const getImageBlob = async (base64Data) => {
        const response = await fetch(base64Data)
        console.log('the response', response)
        const blob = await response.blob()
        console.log('the blob', blob)
        if (blob.size > 5000000) { // 500KB limit
          throw new Error('Image size too large - please use a smaller image')
        }
        return blob
      }

      // Process image if it's base64
      if (metadata.image.startsWith('data:image')) {
        const imageBlob = await getImageBlob(metadata.image)
        console.log('the image blob', imageBlob)
        // Convert blob to base64 string
        const reader = new FileReader()
        const base64 = await new Promise((resolve) => {
          reader.onloadend = () => resolve(reader.result)
          reader.readAsDataURL(imageBlob)
        })
        console.log('the base64', base64)
        metadata.image = base64
      }
      console.log('metadata after the image is ',metadata)
      // Convert metadata to string
      const metadataString = JSON.stringify(metadata)
      console.log('the metadata string', metadataString)
      // Use PUT request with proper headers
      const response = await axios({
        method: 'PUT', // Changed from PUT to POST
        url: `https://publisher.walrus-testnet.walrus.space/v1/store`,
        data: metadataString,
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 30000
      })

      // Handle both new and existing blob responses
      const blobId = response.data.newlyCreated?.blobObject?.blobId || 
                    response.data.alreadyCertified?.blobId
    console.log('the response data', response.data)

      if (!blobId) {
        throw new Error('Invalid response from Walrus')
      }
      console.log('the blob id after walrus', blobId)
      return blobId
    } catch (error) {
      console.error('Error uploading to Walrus:', error)
      if (axios.isAxiosError(error)) {
        if (error.response) {
          const message = error.response.data?.error || error.response.data?.message || 'Unknown error'
          throw new Error(`Upload failed: ${message}`)
        } else if (error.request) {
          throw new Error('Network error - please try again')
        }
      }
      throw error
    }
  }

  const getFromWalrus = async (blobId) => {
    try {
        console.log(`${WALRUS_CONFIG.aggregator}/v1/${blobId}`)
      const response = await axios.get(
        `https://aggregator.walrus-testnet.walrus.space/v1/${blobId}`,
        { 
          timeout: 30000,
          responseType: 'json'
        }
      )
      return response.data
    } catch (error) {
      console.error('Error fetching from Walrus:', error)
      throw error
    }
  }

  return { uploadToWalrus, getFromWalrus }
} 