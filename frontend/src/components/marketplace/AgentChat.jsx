import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useWeb3 } from '../../context/Web3Context'
import { Button } from '../shared/Button'
import { Input } from '../shared/Input'
import { ArrowLeft } from 'lucide-react'
import { VoiceInput } from '../shared/VoiceInput'

// Same language configuration as MintForm
const LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Spanish' },
  { code: 'fr', name: 'French' },
  { code: 'de', name: 'German' },
  { code: 'it', name: 'Italian' },
  { code: 'ja', name: 'Japanese' },
  { code: 'ko', name: 'Korean' },
  { code: 'zh', name: 'Chinese' },
  { code: 'hi', name: 'Hindi' }
]

// Same transliteration function as MintForm
const transliterate = async (text, language) => {
  try {
    const response = await fetch(`https://inputtools.google.com/request?text=${encodeURIComponent(text)}&itc=${language}-t-i0-und&num=1`)
    const data = await response.json()
    
    if (data[0] === 'SUCCESS') {
      return data[1][0][1][0]
    }
    return text
  } catch (error) {
    console.error('Transliteration error:', error)
    return text
  }
}

// Same translation function as MintForm
const translateText = async (text, fromLang, toLang = 'en') => {
  try {
    let nativeText = text
    if (fromLang === 'hi') {
      nativeText = await transliterate(text, 'hi')
    }

    const response = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(nativeText)}&langpair=${fromLang}|${toLang}&key=3b4ad687568b5bb8a34e`
    )
    const data = await response.json()
    
    if (data.responseStatus === 200) {
      return {
        english: data.responseData.translatedText,
        native: nativeText
      }
    } else {
      throw new Error(data.responseMessage || 'Translation failed')
    }
  } catch (error) {
    console.error('Translation error:', error)
    return {
      english: text,
      native: text
    }
  }
}

export function AgentChat() {
  const { tokenURI } = useParams()
  const { account } = useWeb3()
  const navigate = useNavigate()
  const [messages, setMessages] = useState([])
  const [currentMessage, setCurrentMessage] = useState('')
  const [nativeInput, setNativeInput] = useState('')
  const [selectedLanguage, setSelectedLanguage] = useState('en')
  const [connected, setConnected] = useState(false)
  const wsRef = useRef(null)

  useEffect(() => {
    // Connect to WebSocket when component mounts
    connectToAgent()

    // Cleanup on unmount
    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [])

  const connectToAgent = () => {
    if (wsRef.current) {
      wsRef.current.close()
    }

    console.log('Connecting with:', {
      tokenURI,
      account
    })

    wsRef.current = new WebSocket(`ws://localhost:8000/ws/${tokenURI}/${account}`)

    wsRef.current.onopen = () => {
      console.log('Connected to WebSocket')
      setConnected(true)
      addMessage('System', 'Connected to agent')
    }

    wsRef.current.onmessage = async (event) => {
      const response = JSON.parse(event.data)
      const agentMessage = response.response || JSON.stringify(response)
      
      // Keep original English response and translate to selected language
      if (selectedLanguage !== 'en') {
        try {
          // Translate from English to selected language (e.g., Hindi)
          const { english: translatedText } = await translateText(agentMessage, 'en', selectedLanguage)
          addMessage('Agent', agentMessage, translatedText) // English message first, translated message second
        } catch (error) {
          console.error('Translation error:', error)
          addMessage('Agent', agentMessage) // Fallback to English only if translation fails
        }
      } else {
        addMessage('Agent', agentMessage) // English only for English users
      }
    }

    wsRef.current.onclose = () => {
      console.log('Disconnected from WebSocket')
      setConnected(false)
      addMessage('System', 'Disconnected from agent')
    }

    wsRef.current.onerror = (error) => {
      console.error('WebSocket error:', error)
      addMessage('System', 'Error: ' + error.message)
    }
  }

  const disconnectWebSocket = () => {
    if (wsRef.current) {
      wsRef.current.close()
    }
  }

  const addMessage = (sender, text, nativeText = null) => {
    setMessages(prev => [...prev, {
      sender,
      text,
      nativeText,
      timestamp: new Date().toLocaleTimeString()
    }])
  }

  const handleMessageChange = async (e) => {
    const newText = e.target.value
    setNativeInput(newText)
    
    if (selectedLanguage !== 'en' && newText) {
      const { english, native } = await translateText(newText, selectedLanguage)
      setNativeInput(native)
      setCurrentMessage(english)
    } else {
      setCurrentMessage(newText)
    }
  }

  const handleVoiceInput = async (transcript) => {
    if (selectedLanguage !== 'en') {
      const { english, native } = await translateText(transcript, selectedLanguage)
      setNativeInput(native)
      setCurrentMessage(english)
    } else {
      setNativeInput('')
      setCurrentMessage(transcript)
    }
  }

  const sendMessage = async (e) => {
    e.preventDefault()
    
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      alert('Not connected to agent')
      return
    }

    if (currentMessage.trim()) {
      // Send English message to backend
      wsRef.current.send(JSON.stringify({
        prompt: currentMessage
      }))

      // Add both native and English messages to chat
      addMessage('You', currentMessage, selectedLanguage !== 'en' ? nativeInput : null)
      setCurrentMessage('')
      setNativeInput('')
    }
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="bg-gray-800 rounded-xl p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <Button
              variant="ghost"
              onClick={() => navigate(-1)}
              className="flex items-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              className="px-3 py-2 rounded-lg border border-gray-700 bg-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              {LANGUAGES.map(lang => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
            <div className="flex items-center space-x-2">
              <span className={`w-2 h-2 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm text-gray-400">
                {connected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
          </div>

          <div className="h-[500px] overflow-y-auto space-y-4 p-4 bg-gray-900 rounded-lg">
            {messages.map((msg, index) => (
              <div 
                key={index}
                className={`p-3 rounded-lg ${
                  msg.sender === 'You' ? 'bg-purple-500 ml-auto' : 
                  msg.sender === 'System' ? 'bg-gray-600 mx-auto text-center' : 'bg-gray-700'
                } max-w-[80%] ${
                  msg.sender === 'You' ? 'ml-auto' : 
                  msg.sender === 'System' ? 'mx-auto' : 'mr-auto'
                }`}
              >
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">{msg.sender}</span>
                  <span className="text-gray-400">{msg.timestamp}</span>
                </div>
                {msg.nativeText && selectedLanguage !== 'en' && (
                  <p className="text-sm mb-2 text-purple-300">{msg.nativeText}</p>
                )}
                <p className="text-sm text-gray-200">{msg.text}</p>
              </div>
            ))}
          </div>

          <form onSubmit={sendMessage} className="space-y-2">
            {selectedLanguage !== 'en' ? (
              <div className="space-y-2">
                <Input
                  value={nativeInput}
                  onChange={handleMessageChange}
                  placeholder={`Type in ${LANGUAGES.find(l => l.code === selectedLanguage)?.name}...`}
                  className="bg-gray-700"
                />
                <Input
                  value={currentMessage}
                  readOnly
                  placeholder="English translation..."
                  className="bg-gray-700"
                />
              </div>
            ) : (
              <Input
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                placeholder="Type your message..."
                className="bg-gray-700"
              />
            )}
            
            <div className="flex space-x-2">
              <VoiceInput
                onTranscript={handleVoiceInput}
                className="ml-2"
              />
              <Button type="submit" disabled={!connected}>
                Send
              </Button>
            </div>
          </form>

          <Button
            onClick={disconnectWebSocket}
            variant="secondary"
            disabled={!connected}
            className="w-full"
          >
            Disconnect
          </Button>
        </div>
      </div>
    </div>
  )
}