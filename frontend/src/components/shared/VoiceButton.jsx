import { useState } from 'react'
import { Volume2, VolumeX } from 'lucide-react'
import { useVoice } from '../../services/voice'
import { Button } from './Button'

export function VoiceButton({ text }) {
  const [isSpeaking, setIsSpeaking] = useState(false)
  const { speak, stopSpeaking } = useVoice()

  const handleClick = () => {
    if (isSpeaking) {
      stopSpeaking()
      setIsSpeaking(false)
    } else {
      speak(text, {
        rate: 1,
        pitch: 1,
        volume: 1
      })
      setIsSpeaking(true)
    }
  }

  return (
    <Button
      onClick={handleClick}
      variant="outline"
      className="p-2"
      title={isSpeaking ? "Stop Speaking" : "Read Aloud"}
    >
      {isSpeaking ? (
        <VolumeX className="w-4 h-4" />
      ) : (
        <Volume2 className="w-4 h-4" />
      )}
    </Button>
  )
} 