import { useEffect, useState } from 'react'
import { VFXEmitter } from 'wawa-vfx'
import { Vector3 } from 'three'
import { MathUtils } from 'three'
import { useSceneStore } from '@/store/SceneStore'

export const SparksEmitter = ({ position, velocity }: { position: Vector3, velocity: Vector3 }) => {
  const [shouldDestroy, setShouldDestroy] = useState(false)
  const velocity_normalized = new Vector3(velocity.x, velocity.y, velocity.z).normalize()
  const { globalScale } = useSceneStore()

  const POS_SPREAD = 0.2 * Math.pow(globalScale, 0.5)
  const DIR_SPREAD = 0.6
  const MIN_SPEED = 0.2 * Math.pow(globalScale, 0.5)
  const MAX_SPEED = 10 * Math.pow(globalScale, 0.5)
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
        size: [0.02 * Math.pow(globalScale, 0.5), 0.04 * Math.pow(globalScale, 0.5)],
        speed: [MIN_SPEED, velocity.length()*IMPACT_SCALE],
        startPositionMin: [
          position.x-POS_SPREAD, 
          position.y-POS_SPREAD, 
          position.z-POS_SPREAD],
        startPositionMax: [
          position.x+POS_SPREAD, 
          position.y+POS_SPREAD, 
          position.z+POS_SPREAD],
        directionMin: [
          velocity_normalized.x-DIR_SPREAD, 
          velocity_normalized.y-DIR_SPREAD, 
          velocity_normalized.z-DIR_SPREAD],
        directionMax: [
          velocity_normalized.x+DIR_SPREAD, 
          velocity_normalized.y+DIR_SPREAD, 
          velocity_normalized.z+DIR_SPREAD],
        colorStart: ["#f09965"],
        colorEnd: ["#ff0303"],
      }}
    />
  )
} 