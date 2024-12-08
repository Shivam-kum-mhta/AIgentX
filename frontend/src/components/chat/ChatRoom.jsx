import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Bot, User, Sparkles, Brain } from 'lucide-react'
import * as THREE from 'three'
import { Button } from '../shared/Button'
import { VoiceInput } from '../shared/VoiceInput'

export function ChatRoom({ agent, messages, onSendMessage }) {
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef(null)
  const containerRef = useRef(null)
  const threeContainerRef = useRef(null)

  // Three.js background setup
  useEffect(() => {
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000)
    const renderer = new THREE.WebGLRenderer({ 
      alpha: true, 
      antialias: true,
      powerPreference: "high-performance"
    })
    
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    threeContainerRef.current.appendChild(renderer.domElement)

    // Create subtle floating particles
    const createParticles = () => {
      const geometry = new THREE.BufferGeometry()
      const count = 1000
      const positions = new Float32Array(count * 3)
      const colors = new Float32Array(count * 3)

      const color1 = new THREE.Color('#9F7AEA')
      const color2 = new THREE.Color('#EC4899')

      for(let i = 0; i < count; i++) {
        const i3 = i * 3
        positions[i3] = (Math.random() - 0.5) * 10
        positions[i3 + 1] = (Math.random() - 0.5) * 10
        positions[i3 + 2] = (Math.random() - 0.5) * 10

        const mixedColor = color1.clone().lerp(color2, Math.random())
        colors[i3] = mixedColor.r
        colors[i3 + 1] = mixedColor.g
        colors[i3 + 2] = mixedColor.b
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
      geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3))

      const material = new THREE.PointsMaterial({
        size: 0.02,
        vertexColors: true,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending,
      })

      return new THREE.Points(geometry, material)
    }

    const particles = createParticles()
    scene.add(particles)
    camera.position.z = 5

    let mouseX = 0
    let mouseY = 0
    let targetX = 0
    let targetY = 0

    const handleMouseMove = (event) => {
      mouseX = (event.clientX / window.innerWidth) * 2 - 1
      mouseY = -(event.clientY / window.innerHeight) * 2 + 1
    }

    window.addEventListener('mousemove', handleMouseMove)

    const animate = () => {
      targetX += (mouseX - targetX) * 0.02
      targetY += (mouseY - targetY) * 0.02

      particles.rotation.y += 0.0002 + targetX * 0.0005
      particles.rotation.x += 0.0001 + targetY * 0.0005

      // Add wave effect
      const positions = particles.geometry.attributes.position.array
      const time = Date.now() * 0.0001
      
      for(let i = 0; i < positions.length; i += 3) {
        positions[i + 1] += Math.sin(time + positions[i]) * 0.0005
      }
      particles.geometry.attributes.position.needsUpdate = true

      renderer.render(scene, camera)
      requestAnimationFrame(animate)
    }

    animate()

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('resize', handleResize)
      scene.traverse(object => {
        if (object.geometry) object.geometry.dispose()
        if (object.material) object.material.dispose()
      })
      renderer.dispose()
      threeContainerRef.current?.removeChild(renderer.domElement)
    }
  }, [])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!input.trim()) return

    setInput('')
    setIsTyping(true)
    await onSendMessage(input)
    setIsTyping(false)
  }

  return (
    <div className="relative min-h-screen">
      {/* Three.js Background */}
      <div ref={threeContainerRef} className="fixed inset-0 -z-20" />
      
      {/* Gradient Overlays */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-[#0A0B14]/95 via-[#0A0B14]/80 to-[#0A0B14]/95" />
      <div className="fixed inset-0 -z-10 bg-gradient-to-r from-purple-500/5 via-transparent to-pink-500/5" />

      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed top-0 left-0 right-0 z-10 bg-[#0A0B14]/80 backdrop-blur-lg border-b border-purple-500/10"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="absolute inset-0 bg-purple-500/20 rounded-full blur-xl animate-pulse" />
              <div className="relative p-2 bg-purple-500/10 rounded-full">
                <Brain className="w-6 h-6 text-purple-400" />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold space-text-gradient">{agent.name}</h2>
              <p className="text-sm text-gray-400">AI Agent</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Chat Container */}
      <div className="pt-24 pb-24">
        <div className="container mx-auto px-4">
          <div 
            ref={containerRef}
            className="space-y-6"
          >
            <AnimatePresence initial={false}>
              {messages.map((message, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className={`flex items-start space-x-4 ${
                    message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}
                >
                  {/* Avatar */}
                  <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className={`flex-shrink-0 w-8 h-8 rounded-lg ${
                      message.role === 'user' 
                        ? 'bg-purple-500/20' 
                        : 'bg-pink-500/20'
                    } flex items-center justify-center`}
                  >
                    {message.role === 'user' ? (
                      <User className="w-4 h-4 text-purple-400" />
                    ) : (
                      <Bot className="w-4 h-4 text-pink-400" />
                    )}
                  </motion.div>

                  {/* Message Bubble */}
                  <motion.div
                    initial={{ scale: 0.95 }}
                    animate={{ scale: 1 }}
                    className={`relative flex-1 px-6 py-4 rounded-2xl space-card ${
                      message.role === 'user'
                        ? 'ml-12 bg-purple-500/5'
                        : 'mr-12 bg-gray-800/50'
                    }`}
                  >
                    {/* Animated gradient border */}
                    <div className="absolute inset-0 rounded-2xl overflow-hidden">
                      <div className={`absolute inset-0 bg-gradient-to-r ${
                        message.role === 'user'
                          ? 'from-purple-500/10 via-transparent to-purple-500/10'
                          : 'from-pink-500/10 via-transparent to-pink-500/10'
                      } opacity-0 group-hover:opacity-100 transition-opacity`} />
                    </div>
                    <p className="text-gray-200 relative z-10">{message.content}</p>
                  </motion.div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Typing Indicator */}
            <AnimatePresence>
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="flex items-center space-x-4"
                >
                  <div className="w-8 h-8 rounded-lg bg-pink-500/20 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-pink-400 animate-pulse" />
                  </div>
                  <div className="space-card px-6 py-4 bg-gray-800/50">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 bg-pink-500/50 rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-pink-500/50 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-2 h-2 bg-pink-500/50 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div ref={messagesEndRef} />
          </div>
        </div>
      </div>

      {/* Input Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="fixed bottom-0 left-0 right-0 bg-[#0A0B14]/80 backdrop-blur-lg border-t border-purple-500/10"
      >
        <div className="container mx-auto px-4 py-4">
          <form onSubmit={handleSubmit} className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="w-full px-6 py-4 space-input pr-24"
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center space-x-2">
              <VoiceInput
                onTranscript={(text) => setInput(text)}
                className="text-gray-400 hover:text-gray-300 transition-colors"
              />
              <Button
                type="submit"
                disabled={!input.trim() || isTyping}
                className="p-2 space-button hover:bg-purple-500/10"
              >
                <Send className="w-5 h-5" />
              </Button>
            </div>
          </form>
        </div>
      </motion.div>
    </div>
  )
} 