import { useEffect, useState } from 'react'
import { VFXEmitter } from 'wawa-vfx'
import { Vector3 } from 'three'
import { useGLTF } from '@react-three/drei'

export const DebrisEmitter = () => {
  const POSITION_SPREAD = 0.2
  const DIRECTION_SPREAD = 1

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
      settings={{
        spawnMode: "time",
        delay: 0,
        loop: true,
        duration: 2,
        nbParticles: 100,
        size: [0.15, 0.5],
        particlesLifetime: [0.5, 1],
        speed: [0, 2],
        directionMin: [-DIRECTION_SPREAD, -DIRECTION_SPREAD, -DIRECTION_SPREAD],
        directionMax: [DIRECTION_SPREAD, DIRECTION_SPREAD, DIRECTION_SPREAD],
        rotationSpeedMin: [-3.14, -3.14, -31.4],
        rotationSpeedMax: [3.14, 3.14, 31.4],
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
// useGLTF.preload("debris.glb");