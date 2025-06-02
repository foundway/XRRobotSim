import * as THREE from 'three'
import React, { JSX, useEffect, useRef } from 'react'
import { Handle, HandleTarget } from '@react-three/handle'
import { useGLTF, useAnimations } from '@react-three/drei'
import { useModels } from '@/context/AppContext'
import { useModelStore } from '@/store/ModelStore'
import { useSceneStore } from '@/store/SceneStore'
import { useAnimationStore } from '@/store/AnimationStore'
import { useFrame, useThree } from '@react-three/fiber'
import { useXRInputSourceState } from '@react-three/xr'

export const Character = (props: JSX.IntrinsicElements['group']) => {  
  const { currentAnimation, setCurrentAnimation, setAnimations, rotation } = useAnimationStore()
  const { scale, isMenuVisible } = useModelStore()
  const { centeringOffset, setOrbitCenter, setStageRadius, setCenteringOffset } = useSceneStore()
  const rightController = useXRInputSourceState('controller', 'right')
  const { currentModel } = useModels()
  const modelUrl = currentModel.url
  const { scene, nodes, animations } = useGLTF(modelUrl)
  const group = React.useRef<THREE.Group>(null)
  const rightPlaceholderRef = React.useRef<THREE.Mesh | null>(null)
  const { actions } = useAnimations(animations, group)
  const { camera } = useThree()
  const CharacterOrigin = useRef<THREE.Object3D>(null)
  const UNSET_ROUGHNESS = 1
  const UNSET_THICKNESS = 0
  const FALLBACK_ROUGHNESS = 0.1 
  const FALLBACK_THICKNESS = 1
  const CHARACTER_ORIGIN = new THREE.Vector3(0, 0, -5)

  useEffect(() => {
    const rightPlaceholder = new THREE.Mesh(
      new THREE.BoxGeometry(0.5, 0.5, 0.5),
      new THREE.MeshBasicMaterial({ color: 'green', wireframe: true })
    )
    scene.add(rightPlaceholder)
    rightPlaceholderRef.current = rightPlaceholder
    return () => {
      scene.remove(rightPlaceholder)
    }
  }, [scene])

  useFrame(() => {
    if (nodes['spine005']) {
      nodes['spine005'].quaternion.copy(camera.quaternion)
      nodes['spine005'].rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), Math.PI)
    }

    if (rightController?.object?.position && rightPlaceholderRef.current) {
      const worldPosition = rightController.object.getWorldPosition(new THREE.Vector3())
      const worldQuaternion = rightController.object.getWorldQuaternion(new THREE.Quaternion())
      rightPlaceholderRef.current.position.copy(worldPosition.multiplyScalar(2).applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI))
      // rightPlaceholderRef.current.quaternion.copy(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI).multiply(worldQuaternion))
      rightPlaceholderRef.current.quaternion.copy(worldQuaternion)
      rightPlaceholderRef.current.rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), Math.PI)
    }
  })

  // Add placeholder box to head joint
  useEffect(() => {
    if (nodes['spine005']) {
      const box = new THREE.Mesh(
        new THREE.BoxGeometry(0.2, 0.4, 0.2),
        new THREE.MeshBasicMaterial({ color: 'blue', wireframe: true })
      )
      box.position.set(0, 0.2, 0) // Position slightly above the head
      nodes['spine005'].add(box)
    }
  }, [nodes['spine005']])

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
    <group {...props} ref={CharacterOrigin} position={CHARACTER_ORIGIN} rotation={[0, Math.PI, 0]} dispose={null}>
      <primitive object={scene} scale={scale} userData={{ isCharacter: true }} />
    </group>
  )
}