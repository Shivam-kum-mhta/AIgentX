import { STABILITY_API_KEY } from '../utils/constants'
import { useRetry } from '../hooks/useRetry'

export function useStability() {
  const { retry } = useRetry()
  
  const generateImage = async (prompt) => {
    return await retry(async () => {
      try {
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        const response = await fetch(
          'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              'Authorization': `Bearer ${STABILITY_API_KEY}`,
              'Stability-Client-ID': 'aigentx-dapp'
            },
            body: JSON.stringify({
              text_prompts: [{ text: prompt, weight: 1 }],
              cfg_scale: 7,
              height: 1024,
              width: 1024,
              samples: 1,
              steps: 30,
              style_preset: "digital-art",
              image_strength: 1,
              seed: 0,
              sampler: "K_DPM_2_ANCESTRAL"
            }),
          }
        )

        if (!response.ok) {
          const error = await response.json().catch(() => ({}))
          if (response.status === 429) {
            throw new Error('Rate limit exceeded. Retrying in a moment...')
          }
          throw new Error(error.message || 'Failed to generate image')
        }

        const { artifacts } = await response.json()
        return `data:image/png;base64,${artifacts[0].base64}`
      } catch (error) {
        console.error('Error generating image:', error)
        if (error.message.includes('Rate limit') || 
            error.message.includes('dimensions')) {
          throw error // Allow retry for rate limits and dimension errors
        }
        return 'https://via.placeholder.com/1024x1024?text=AI+Agent'
      }
    }, 3, 2000)
  }

  return { generateImage }
} 