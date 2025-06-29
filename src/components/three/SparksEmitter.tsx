import { useEffect, useState } from 'react'
import { VFXEmitter } from 'wawa-vfx'
import { Vector3 } from 'three'
import { MathUtils } from 'three'
import { GLOBAL_SCALE } from './Scene'


export const SparksEmitter = ({ position, velocity }: { position: Vector3, velocity: Vector3 }) => {
  const [shouldDestroy, setShouldDestroy] = useState(false)
  const velocity_normalized = new Vector3(velocity.x, velocity.y, velocity.z).normalize()

  const POSITION_SPREAD = 0.2 * GLOBAL_SCALE
  const DIRECTION_SPREAD = 0.7 * GLOBAL_SCALE
  const MIN_SPEED = 0.2 * GLOBAL_SCALE
  const MAX_SPEED = 10 * GLOBAL_SCALE
  const IMPACT_SCALE = 0.5
  const PARTICLE_COUNT_MULTIPLIER = 200

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
        nbParticles: MathUtils.inverseLerp(MIN_SPEED, MAX_SPEED, velocity.length())*PARTICLE_COUNT_MULTIPLIER,
        spawnMode: "burst", 
        delay: 0, 
        particlesLifetime: [0.1, 1],

        size: [0.02*GLOBAL_SCALE, 0.04*GLOBAL_SCALE],
        speed: [MIN_SPEED, velocity.length()*IMPACT_SCALE],

        startPositionMin: [
          position.x-POSITION_SPREAD, 
          position.y-POSITION_SPREAD, 
          position.z-POSITION_SPREAD],
        startPositionMax: [
          position.x+POSITION_SPREAD, 
          position.y+POSITION_SPREAD, 
          position.z+POSITION_SPREAD],
        directionMin: [
          velocity_normalized.x-DIRECTION_SPREAD, 
          velocity_normalized.y-DIRECTION_SPREAD, 
          velocity_normalized.z-DIRECTION_SPREAD],
        directionMax: [
          velocity_normalized.x+DIRECTION_SPREAD, 
          velocity_normalized.y+DIRECTION_SPREAD, 
          velocity_normalized.z+DIRECTION_SPREAD],

        colorStart: ["#f09965"],
        colorEnd: ["#ff0303"],
      }}
    />
  )
} 