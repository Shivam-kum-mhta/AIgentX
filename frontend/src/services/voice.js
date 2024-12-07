export function useVoice() {
  const synth = window.speechSynthesis
  
  const speak = (text, options = {}) => {
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = options.rate || 1
    utterance.pitch = options.pitch || 1
    utterance.volume = options.volume || 1
    utterance.voice = options.voice || synth.getVoices()[0]
    synth.speak(utterance)
  }

  const getVoices = () => {
    return synth.getVoices()
  }

  const stopSpeaking = () => {
    synth.cancel()
  }

  return {
    speak,
    getVoices,
    stopSpeaking
  }
} 