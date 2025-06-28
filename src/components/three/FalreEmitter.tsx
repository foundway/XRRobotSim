import { useEffect, useState } from 'react'
import { VFXEmitter } from 'wawa-vfx'

const POSITION_SPREAD = 0.2
const DESTROY_DELAY = 1500

export const FlareEmitter = () => {
  const [shouldDestroy, setShouldDestroy] = useState(false)
  useEffect(() => {
    const timer = setTimeout(() => {
      setShouldDestroy(true)
    }, DESTROY_DELAY) // Self-destruct after 1 second

    return () => clearTimeout(timer)
  }, [])

  if (shouldDestroy) {
    return null
  }

  return (
    <VFXEmitter
      emitter="flare"
      settings={{
        spawnMode: "burst",
        loop: true,
        duration: 0.5,
        nbParticles: 10,
        size: [2, 3],
        particlesLifetime: [0.1, 0.2],
        speed: [0, 0],
        startPositionMin: [-POSITION_SPREAD, -POSITION_SPREAD, -POSITION_SPREAD],
        startPositionMax: [POSITION_SPREAD, POSITION_SPREAD, POSITION_SPREAD],
        startRotationMin: [0, 0, -6.28],
        startRotationMax: [0, 0, 6.28],
        colorStart: ["#77ff77"],
        colorEnd: ["#ff1111"],
      }}
    />
  )
} 