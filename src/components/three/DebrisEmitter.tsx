import { useEffect, useState } from 'react'
import { VFXEmitter } from 'wawa-vfx'
import { Vector3 } from 'three'
import { useGLTF } from '@react-three/drei'

export const DebrisEmitter = () => {
  const [shouldDestroy, setShouldDestroy] = useState(false)
  const IMPACT_SCALE = 0.7
  const POSITION_SPREAD = 1
  const DIRECTION_SPREAD = 1
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
      emitter="debris" // Target the particle system by name
      localDirection={true}
      debug={true}
      settings={{
        spawnMode: "time",
        loop: true,
        duration: 1,
        nbParticles: 100,
        size: [0.5, 1],
        particlesLifetime: [1, 1],
        speed: [1, 5],
        startPositionMin: [-5, -5, 2],
        startPositionMax: [5, 5, 2],
        startRotationMin: [0, 0, 0],
        startRotationMax: [Math.PI, Math.PI, Math.PI],
      }}
    />
  )
} 
useGLTF.preload("debris.glb");