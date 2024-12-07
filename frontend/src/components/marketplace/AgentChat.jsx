import { useState, useRef, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useWeb3 } from '../../context/Web3Context'
import { Button } from '../shared/Button'
import { ArrowLeft } from 'lucide-react'
import { VoiceInput } from '../shared/VoiceInput'

export function AgentChat() {
  const { tokenURI } = useParams()
  const { account } = useWeb3()
  const navigate = useNavigate()
  const [messages, setMessages] = useState([])
  const [currentMessage, setCurrentMessage] = useState('')
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

    wsRef.current.onmessage = (event) => {
      const response = JSON.parse(event.data)
      addMessage('Agent', response.response || JSON.stringify(response))
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

  const addMessage = (sender, text) => {
    setMessages(prev => [...prev, {
      sender,
      text,
      timestamp: new Date().toLocaleTimeString()
    }])
  }

  const sendMessage = (e) => {
    e.preventDefault()
    
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      alert('Not connected to agent')
      return
    }

    if (currentMessage.trim()) {
      wsRef.current.send(JSON.stringify({
        prompt: currentMessage
      }))

      addMessage('You', currentMessage)
      setCurrentMessage('')
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
                <p className="text-sm">{msg.text}</p>
              </div>
            ))}
          </div>

          <form onSubmit={sendMessage} className="flex space-x-2">
            <div className="relative flex items-center">
              <input
                type="text"
                value={currentMessage}
                onChange={(e) => setCurrentMessage(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 bg-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 pr-12"
              />
              <VoiceInput
                onTranscript={(transcript) => setCurrentMessage(transcript)}
                className="absolute right-2"
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