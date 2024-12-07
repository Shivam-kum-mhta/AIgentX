import { useState, useCallback } from 'react'
import { Mic, MicOff, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'

export function VoiceInput({ onTranscript, className = '' }) {
  const [isListening, setIsListening] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const startListening = useCallback(() => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Speech recognition is not supported in this browser')
      return
    }

    const recognition = new window.webkitSpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'en-US'

    recognition.onstart = () => {
      setIsListening(true)
      setIsLoading(true)
    }

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      onTranscript(transcript)
      setIsLoading(false)
      setIsListening(false)
    }

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error)
      setIsLoading(false)
      setIsListening(false)
    }

    recognition.onend = () => {
      setIsLoading(false)
      setIsListening(false)
    }

    recognition.start()
  }, [onTranscript])

  return (
    <motion.button
      type="button"
      onClick={startListening}
      disabled={isListening}
      whileTap={{ scale: 0.95 }}
      className={`inline-flex items-center justify-center p-2 rounded-full 
        ${isListening ? 'bg-red-500 hover:bg-red-600' : 'bg-purple-600 hover:bg-purple-700'} 
        text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500
        disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {isLoading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : isListening ? (
        <MicOff className="w-5 h-5" />
      ) : (
        <Mic className="w-5 h-5" />
      )}
    </motion.button>
  )
} 