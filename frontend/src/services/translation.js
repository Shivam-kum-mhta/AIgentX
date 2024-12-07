import { MEMORY_TRANSLATE_KEY } from '../utils/constants'

export function useTranslation() {
  const translate = async (text, targetLang = 'en') => {
    try {
      const response = await fetch('https://api.memory.ai/v1/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${MEMORY_TRANSLATE_KEY}`
        },
        body: JSON.stringify({
          text,
          target_lang: targetLang
        })
      })

      if (!response.ok) {
        throw new Error('Translation failed')
      }

      const data = await response.json()
      return data.translated_text
    } catch (error) {
      console.error('Translation error:', error)
      return text // Return original text if translation fails
    }
  }

  return { translate }
} 