import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export function AnimatedBackground() {
  const containerRef = useRef()
  
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
    containerRef.current.appendChild(renderer.domElement)

    // Create particles with increased size
    const createParticleSystem = (count, color, size, spread) => {
      const geometry = new THREE.BufferGeometry()
      const positions = new Float32Array(count * 3)
      const velocities = new Float32Array(count * 3)

      for(let i = 0; i < count * 3; i += 3) {
        // Position
        positions[i] = (Math.random() - 0.5) * spread
        positions[i + 1] = (Math.random() - 0.5) * spread
        positions[i + 2] = (Math.random() - 0.5) * (spread / 3)

        // Initial velocity
        velocities[i] = (Math.random() - 0.5) * 0.002
        velocities[i + 1] = (Math.random() - 0.5) * 0.002
        velocities[i + 2] = (Math.random() - 0.5) * 0.002
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
      geometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3))

      const material = new THREE.PointsMaterial({
        size,
        color: new THREE.Color(color),
        transparent: true,
        opacity: 0.9, // Increased opacity
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      })

      const points = new THREE.Points(geometry, material)
      points.userData.velocities = velocities
      return points
    }

    // Create particle systems with increased sizes
    const particleSystems = [
      createParticleSystem(2000, '#9F7AEA', 0.03, 8),  // Doubled size
      createParticleSystem(1500, '#EC4899', 0.025, 7), // Doubled size
      createParticleSystem(1000, '#8B5CF6', 0.02, 6),  // Doubled size
    ]

    particleSystems.forEach(system => scene.add(system))
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
      targetX += (mouseX - targetX) * 0.05
      targetY += (mouseY - targetY) * 0.05

      particleSystems.forEach((system, index) => {
        const positions = system.geometry.attributes.position.array
        const velocities = system.userData.velocities

        for(let i = 0; i < positions.length; i += 3) {
          // Update position based on velocity and mouse influence
          positions[i] += velocities[i] + (targetX * 0.001)
          positions[i + 1] += velocities[i + 1] + (targetY * 0.001)
          positions[i + 2] += velocities[i + 2]

          // Boundary check
          const boundary = 4
          for(let j = 0; j < 3; j++) {
            if(Math.abs(positions[i + j]) > boundary) {
              positions[i + j] = -positions[i + j] * 0.5
              velocities[i + j] *= -0.5
            }
          }
        }

        system.geometry.attributes.position.needsUpdate = true

        // Add slight base rotation
        system.rotation.y += 0.0002 * (index + 1)
      })

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
      containerRef.current?.removeChild(renderer.domElement)
    }
  }, [])

  return (
    <>
      <div ref={containerRef} className="fixed inset-0 -z-20" />
      {/* Lighter gradient overlay for better particle visibility */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-b from-[#0A0A0F]/90 via-[#0A0A0F]/70 to-[#0A0A0F]/90" />
    </>
  )
} 