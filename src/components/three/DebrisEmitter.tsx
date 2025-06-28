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

  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     setShouldDestroy(true)
  //   }, 1000) // Self-destruct after 1 second

  //   return () => clearTimeout(timer)
  // }, [])

  // if (shouldDestroy) {
  //   return null
  // }

  return (
    <VFXEmitter
      emitter="debris"
      debug={true}
      localDirection={true}
      settings={{
        spawnMode: "time",
        delay: 0,
        loop: true,
        duration: 1,
        nbParticles: 10,
        size: [0.5, 1],
        particlesLifetime: [1, 1],
        speed: [1, 5],
        directionMin: [-1, -1, -1],
        directionMax: [1, 1, 1],
        rotationSpeedMax: [1, 1, 200],
        rotationSpeedMin: [-1, -1, -200],
        startPositionMin: [0, 0, 0],
        startPositionMax: [0, 0, 0],
        startRotationMin: [-1, -1, -Math.PI],
        startRotationMax: [1, 1, Math.PI],
      }}
    />
  )
} 
useGLTF.preload("debris.glb");