import * as THREE from 'three'
import React, { JSX, useEffect, useRef } from 'react'
import { useGLTF, useAnimations } from '@react-three/drei'
import { useModels } from '@/context/AppContext'
import { useModelStore } from '@/store/ModelStore'
import { useSceneStore } from '@/store/SceneStore'
import { useAnimationStore } from '@/store/AnimationStore'
import { useFrame, useThree } from '@react-three/fiber'
import { useXRInputSourceState, XRSpace } from '@react-three/xr'

export const Character = (props: JSX.IntrinsicElements['group']) => {  
  const { currentAnimation, setCurrentAnimation, setAnimations, orientation } = useAnimationStore()
  const { scale, isMenuVisible } = useModelStore()
  const { centeringOffset, setOrbitCenter, setStageRadius, setCenteringOffset } = useSceneStore()
  const rightController = useXRInputSourceState('controller', 'right')
  const leftController = useXRInputSourceState('controller', 'left')
  const { currentModel } = useModels()
  const modelUrl = currentModel.url
  const { scene, nodes, animations } = useGLTF(modelUrl)
  const group = React.useRef<THREE.Group>(null)
  const rightIKTargetRef = React.useRef<THREE.Object3D | null>(null)
  const leftIKTargetRef = React.useRef<THREE.Object3D | null>(null)
  const rightControllerRef = React.useRef<THREE.Object3D | null>(null)
  const leftControllerRef = React.useRef<THREE.Object3D | null>(null)
  const { actions } = useAnimations(animations, group)
  const { camera } = useThree()
  const CharacterOrigin = useRef<THREE.Object3D>(null)
  const UNSET_ROUGHNESS = 1
  const UNSET_THICKNESS = 0
  const FALLBACK_ROUGHNESS = 0.1 
  const FALLBACK_THICKNESS = 1
  const CHARACTER_ORIGIN = new THREE.Vector3(0, 0, -5)

  useEffect(() => { // Add placeholder box to head joint
    if (nodes['spine005']) {
      const box = new THREE.Mesh(
        new THREE.BoxGeometry(0.2, 0.4, 0.2),
        new THREE.MeshBasicMaterial({ color: 'blue', wireframe: true })
      )
      box.position.set(0, 0.2, 0) // Position slightly above the head
      nodes['spine005'].add(box)
    }
  }, [nodes['spine005']])

  useFrame(() => { // Control character with tracking
    if (nodes['spine005']) {
      nodes['spine005'].quaternion.copy(camera.quaternion)
      nodes['spine005'].rotateOnWorldAxis(new THREE.Vector3(0, 1, 0), Math.PI)
    }

    if (rightControllerRef.current && rightIKTargetRef.current) {
      rightIKTargetRef.current.position.copy(
        rightControllerRef.current?.getWorldPosition(new THREE.Vector3()).multiplyScalar(2)
      )
      rightIKTargetRef.current.quaternion.copy(
        rightControllerRef.current?.getWorldQuaternion(new THREE.Quaternion())
      )
    }

    if (leftControllerRef.current && leftIKTargetRef.current) {
      leftIKTargetRef.current.position.copy(
        leftControllerRef.current?.getWorldPosition(new THREE.Vector3()).multiplyScalar(2)
      )
      leftIKTargetRef.current.quaternion.copy(
        leftControllerRef.current?.getWorldQuaternion(new THREE.Quaternion())
      )
    }
  })

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
      const newQuaternion = (new THREE.Quaternion()).setFromAxisAngle(new THREE.Vector3(0, 1, 0), orientation)
      nodes['spine002'].quaternion.copy(newQuaternion)
    }
  }, [orientation, nodes['spine002']])

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
    <>
      <group {...props} ref={CharacterOrigin} position={CHARACTER_ORIGIN} rotation={[0, 0, 0]} dispose={null}>
        <primitive object={scene} scale={scale} userData={{ isCharacter: true }} />
        <group ref={rightIKTargetRef} >
          <axesHelper args={[1]} />
        </group>
        <group ref={leftIKTargetRef} >
          <axesHelper args={[1]} />
        </group>
      </group>
      {rightController?.inputSource?.targetRaySpace && (
        <XRSpace ref={rightControllerRef} space={rightController.inputSource.targetRaySpace}/>
      )}
      {leftController?.inputSource?.targetRaySpace && (
        <XRSpace ref={leftControllerRef} space={leftController.inputSource.targetRaySpace}/>
      )}
    </>
  )
}