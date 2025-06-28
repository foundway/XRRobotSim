import { useEffect, useState } from 'react'
import { VFXEmitter } from 'wawa-vfx'

const POSITION_SPREAD = 0.7
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
        delay: 0,
        loop: true,
        duration: 0.5,
        nbParticles: 10,
        size: [5, 10],
        particlesLifetime: [0.2, 0.5],
        speed: [0, 2],
        startPositionMin: [-POSITION_SPREAD, -POSITION_SPREAD, -POSITION_SPREAD],
        startPositionMax: [POSITION_SPREAD, POSITION_SPREAD, POSITION_SPREAD],
        colorStart: ["#77ff77"],
        colorEnd: ["#ff1111"],
      }}
    />
  )
} 