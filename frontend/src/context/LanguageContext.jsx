import { createContext, useContext, useState } from 'react'
import { useTranslation } from '../services/translation'

const LanguageContext = createContext()

export function LanguageProvider({ children }) {
  const [currentLang, setCurrentLang] = useState('en')
  const { translate } = useTranslation()

  const supportedLanguages = [
    { code: 'en', name: 'English' },
    { code: 'es', name: 'Español' },
    { code: 'fr', name: 'Français' },
    { code: 'de', name: 'Deutsch' },
    { code: 'zh', name: '中文' },
    { code: 'ja', name: '日本語' }
  ]

  const translateText = async (text) => {
    if (currentLang === 'en') return text
    return await translate(text, currentLang)
  }

  return (
    <LanguageContext.Provider value={{
      currentLang,
      setCurrentLang,
      supportedLanguages,
      translateText
    }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
} 