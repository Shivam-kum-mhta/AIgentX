import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Globe, ChevronDown } from 'lucide-react'
import { useLanguage } from '../../context/LanguageContext'

export function LanguageSelector() {
  const [isOpen, setIsOpen] = useState(false)
  const { currentLang, setCurrentLang, supportedLanguages } = useLanguage()

  const currentLanguage = supportedLanguages.find(lang => lang.code === currentLang)

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
      >
        <Globe className="w-4 h-4" />
        <span>{currentLanguage.name}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full right-0 mt-2 w-48 py-2 bg-gray-800 rounded-lg shadow-xl z-50"
          >
            {supportedLanguages.map(lang => (
              <button
                key={lang.code}
                onClick={() => {
                  setCurrentLang(lang.code)
                  setIsOpen(false)
                }}
                className={`
                  w-full px-4 py-2 text-left hover:bg-gray-700 transition-colors
                  ${currentLang === lang.code ? 'text-purple-400' : 'text-gray-300'}
                `}
              >
                {lang.name}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
} 