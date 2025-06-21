import { useEffect, useState } from 'react'
import { VFXEmitter } from 'wawa-vfx'
import { Vector3 } from 'three'

export const SparksEmitter = ({ position, direction }: { position: Vector3, direction: Vector3 }) => {
  const [shouldDestroy, setShouldDestroy] = useState(false)
  const IMPACT_SCALE = 0.7
  const POSITION_SPREAD = 0.2
  const DIRECTION_SPREAD = 1
  const direction_normalized = new Vector3(direction.x, direction.y, direction.z).normalize()
  const MIN_MAX_SPEED = 4
  const MIN_SPEED = 0.2

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
        speed: [MIN_SPEED, Math.max(MIN_MAX_SPEED, direction.length()*IMPACT_SCALE)],

        startPositionMin: [
          position.x-POSITION_SPREAD, 
          position.y-POSITION_SPREAD, 
          position.z-POSITION_SPREAD],
        startPositionMax: [
          position.x+POSITION_SPREAD, 
          position.y+POSITION_SPREAD, 
          position.z+POSITION_SPREAD],
        directionMin: [
          direction_normalized.x-DIRECTION_SPREAD, 
          direction_normalized.y-DIRECTION_SPREAD, 
          direction_normalized.z-DIRECTION_SPREAD],
        directionMax: [
          direction_normalized.x+DIRECTION_SPREAD, 
          direction_normalized.y+DIRECTION_SPREAD, 
          direction_normalized.z+DIRECTION_SPREAD],

        colorStart: ["#f09965"],
        colorEnd: ["#ff0303"],
      }}
    />
  )
} 