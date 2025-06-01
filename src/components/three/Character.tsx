import * as THREE from 'three'
import React, { JSX, useEffect, useRef } from 'react'
import { useGLTF, useAnimations } from '@react-three/drei'
import { useModels } from '@/context/AppContext'
import { useModelStore } from '@/store/ModelStore'
import { useSceneStore } from '@/store/SceneStore'
import { useAnimationStore } from '@/store/AnimationStore'

export const Character = (props: JSX.IntrinsicElements['group']) => {  
  const { currentAnimation, setCurrentAnimation, setAnimations, rotation } = useAnimationStore()
  const { scale, isMenuVisible } = useModelStore()
  const { currentModel } = useModels()
  const modelUrl = currentModel.url
  const { scene, nodes, animations } = useGLTF(modelUrl)
  const group = React.useRef<THREE.Group>(null)
  const { actions } = useAnimations(animations, group)
  const UNSET_ROUGHNESS = 1
  const UNSET_THICKNESS = 0
  const FALLBACK_ROUGHNESS = 0.1 
  const FALLBACK_THICKNESS = 1

  useEffect(() => { 
    if (!scene) return
    scene.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshPhysicalMaterial && child.material.transmission > 0) {
        child.material.transparent = false
        if (child.material.roughness == UNSET_ROUGHNESS) {
          child.material.roughness = FALLBACK_ROUGHNESS
        }
        if (child.material.thickness == UNSET_THICKNESS) {
          child.material.thickness = FALLBACK_THICKNESS
        }
        child.material.side = THREE.FrontSide
      }
    })
  }, [scene])

  useEffect(() => {
    if (nodes['spine002'] != null) {
      nodes['spine002'].rotation.y = rotation
      console.log('rotation: ', rotation)
    }
  }, [rotation, nodes['spine002']])

  useEffect(() => { 
    if (!scene) return
    const box = new THREE.Box3().setFromObject(scene)
    const size = box.getSize(new THREE.Vector3())
    const radius = Math.max(Math.max(size.x, size.y), size.z)
    const center = box.getCenter(new THREE.Vector3())
    const min = box.min
    setCenteringOffset(new THREE.Vector3(-center.x, -min.y, -center.z))
    setOrbitCenter(size.y/2)
    setStageRadius(radius)
  }, [scene])

  useEffect(() => { // Set animation list and play first animation on load
    setAnimations(animations)
    if (animations && animations.length > 0) {
      setCurrentAnimation(animations[0].name)
    } 
  }, [animations, setAnimations, setCurrentAnimation])

  useEffect(() => { // Change animation
    actions[currentAnimation]?.reset().fadeIn(0.5).play()
    return () => {
      actions[currentAnimation]?.fadeOut(0.5)
    }
  }, [currentAnimation])

  return (
    <group ref={scene} {...props} dispose={null}>
      <primitive object={scene} position={new THREE.Vector3(0, 0, -5)} rotation={[0, Math.PI, 0]} scale={scale} userData={{ isCharacter: true }} />
    </group>
  )
}