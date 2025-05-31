import * as THREE from 'three'
import { SkeletonUtils } from 'three-stdlib'
import React, { JSX, useEffect } from 'react'
import { Handle, HandleTarget } from '@react-three/handle'
import { useGLTF, useAnimations } from '@react-three/drei'
import { useModels } from '@/context/AppContext'
import { useModelStore } from '@/store/ModelStore'
import { useSceneStore } from '@/store/SceneStore'
import { useAnimationStore } from '@/store/AnimationStore'

export const Character = (props: JSX.IntrinsicElements['group']) => {  
  const { currentAnimation, setCurrentAnimation, setAnimations } = useAnimationStore()
  const { scale, isMenuVisible } = useModelStore()
  const { centeringOffset, setOrbitCenter, setStageRadius, setCenteringOffset } = useSceneStore()
  const { currentModel } = useModels()
  const modelUrl = currentModel.url
  const { scene, animations } = useGLTF(modelUrl)
  const group = React.useRef<THREE.Group>(null)
  const { actions } = useAnimations(animations, group)
  const UNSET_ROUGHNESS = 1
  const UNSET_THICKNESS = 0
  const FALLBACK_ROUGHNESS = 0.1 
  const FALLBACK_THICKNESS = 1

  const clone = React.useMemo(() => {
    const cloned = SkeletonUtils.clone(scene)
    cloned.traverse((child) => {
      if (child instanceof THREE.Mesh && child.material instanceof THREE.MeshPhysicalMaterial && child.material.transmission > 0) {
        child.material.transparent = false
        if (child.material.roughness == UNSET_ROUGHNESS) { // roughness need to be lower than 1
          child.material.roughness = FALLBACK_ROUGHNESS
        }
        if (child.material.thickness == UNSET_THICKNESS) { // roughness need to be higher than 0
          child.material.thickness = FALLBACK_THICKNESS
        }
        child.material.side = THREE.FrontSide
      } 
    })
    return cloned
  }, [scene])

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
    <group ref={group} scale={scale} {...props} dispose={null}>
      <primitive object={clone} position={new THREE.Vector3(0, 0, -5)} userData={{ isCharacter: true }} />
    </group>
  )
}