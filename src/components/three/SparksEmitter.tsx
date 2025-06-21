import { useEffect, useState } from 'react'
import { VFXEmitter } from 'wawa-vfx'

export const SparksEmitter = () => {
  const [shouldDestroy, setShouldDestroy] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setShouldDestroy(true)
    }, 1000) // Self-destruct after 1 second

    return () => clearTimeout(timer)
  }, [])

  if (shouldDestroy) {
    return null
  }

  return (
    <VFXEmitter
      emitter="sparks" // Target the particle system by name
      localDirection={true}
      settings={{
        loop: false,
        duration: 1, 
        nbParticles: 500, 
        spawnMode: "burst", 
        delay: 0, 
        particlesLifetime: [0.1, 1],

        size: [0.02, 0.04],
        speed: [0.2, 3],

        startPositionMin: [-0.2, -0.2, -0.2],
        startPositionMax: [0.2, 0.2, 0.2],

        directionMin: [-0.5, 0, -0.5],
        directionMax: [0.5, 1, 0.5],

        colorStart: ["#f09965"],
        colorEnd: ["#ff0303"],
      }}
    />
  )
} 