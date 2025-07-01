import { useEffect, useState } from 'react'
import { VFXEmitter } from 'wawa-vfx'
import { Vector3 } from 'three'
import { MathUtils } from 'three'
import { useSceneStore } from '@/store/SceneStore'

export const SparksEmitter = ({ position, velocity }: { position: Vector3, velocity: Vector3 }) => {
  const [shouldDestroy, setShouldDestroy] = useState(false)
  const velocity_normalized = new Vector3(velocity.x, velocity.y, velocity.z).normalize()
  const { globalScale } = useSceneStore()

  const POSITION_SPREAD = 0.2 * globalScale
  const DIRECTION_SPREAD = 0.7
  const MIN_SPEED = 0.2 * globalScale
  const MAX_SPEED = 10 * globalScale
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
        nbParticles: MathUtils.inverseLerp(MIN_SPEED, MAX_SPEED, velocity.length())*PARTICLE_COUNT_MULTIPLIER * globalScale,
        spawnMode: "burst", 
        delay: 0, 
        particlesLifetime: [0.1, 1],
        size: [0.02 * globalScale, 0.04 * globalScale],
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