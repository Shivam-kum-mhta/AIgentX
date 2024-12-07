import { useState } from 'react'
import { useStability } from '../../services/stability'
import { Button } from '../shared/Button'

export function ImageGenerator({ description, onGenerate }) {
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState(null)
  const { generateImage } = useStability()

  const handleGenerate = async () => {
    if (!description) return
    
    setLoading(true)
    try {
      const imageData = await generateImage(description)
      setPreview(imageData)
      onGenerate(imageData)
    } catch (error) {
      console.error('Error generating image:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">AI Generated Image</h3>
        <Button
          onClick={handleGenerate}
          disabled={!description || loading}
          loading={loading}
          variant="secondary"
        >
          Generate
        </Button>
      </div>

      {preview && (
        <div className="relative w-full max-w-2xl mx-auto aspect-square rounded-lg overflow-hidden bg-dark-800">
          <img
            src={preview}
            alt="Generated preview"
            className="w-full h-full object-contain"
          />
        </div>
      )}
    </div>
  )
} 