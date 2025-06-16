import * as THREE from 'three'
import { CCDIKSolver, CCDIKHelper } from 'three/addons/animation/CCDIKSolver.js';
import React, { JSX, useEffect, useRef } from 'react'
import { useGLTF, useAnimations } from '@react-three/drei'
import { useModels } from '@/context/AppContext'
import { useModelStore } from '@/store/ModelStore'
import { useAnimationStore } from '@/store/AnimationStore'
import { useFrame } from '@react-three/fiber'
import { useXRInputSourceState, XRSpace } from '@react-three/xr'

export const Character = (props: JSX.IntrinsicElements['group']) => {  
  const { currentAnimation, setCurrentAnimation, setAnimations, orientation } = useAnimationStore()
  const { scale } = useModelStore()
  const rightController = useXRInputSourceState('controller', 'right')
  const leftController = useXRInputSourceState('controller', 'left')
  const { currentModel } = useModels()
  const modelUrl = currentModel.url
  const { scene, nodes, animations } = useGLTF(modelUrl)
  const group = React.useRef<THREE.Group>(null)
  const parentRef = React.useRef<THREE.Object3D>(null)
  const leftIKTargetRef = React.useRef<THREE.Object3D | null>(null)
  const rightControllerRef = React.useRef<THREE.Object3D | null>(null)
  const leftControllerRef = React.useRef<THREE.Object3D | null>(null)
  const { actions } = useAnimations(animations, group)
  const CharacterOrigin = useRef<THREE.Object3D>(null)
  const UNSET_ROUGHNESS = 1
  const UNSET_THICKNESS = 0
  const FALLBACK_ROUGHNESS = 0.1 
  const FALLBACK_THICKNESS = 1
  const CHARACTER_ORIGIN = new THREE.Vector3(0, 0, -3)
  const ikSolverRef = useRef<CCDIKSolver | null>(null)
  const ikHelperRef = useRef<CCDIKHelper | null>(null)
  const skinnedMeshRef = useRef<THREE.SkinnedMesh | null>(null)

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

  useEffect(() => { // Find the skinned mesh in the model
    scene.traverse((child) => {
      if (child instanceof THREE.SkinnedMesh) {
        skinnedMeshRef.current = child
      }
    })
  }, [scene])

  useEffect(() => { // Set up IK solver
    if (!nodes['upper_armR'] || !nodes['forearmR'] || !nodes['handR'] || !nodes['ikhandR'] || !skinnedMeshRef.current) return

    const mesh = skinnedMeshRef.current
    const skeleton = mesh.skeleton
    const bones = skeleton.bones
    const ikChain = [
      {
        target: bones.findIndex(bone => bone.name === 'ikhandR'),
        effector: bones.findIndex(bone => bone.name === 'handR'),
        links: [
          {
            index: bones.findIndex(bone => bone.name === 'forearmR'),
            rotationMin: new THREE.Vector3(0, 0, 0.1),
            rotationMax: new THREE.Vector3(0, 0, Math.PI/1.5)
          }, {
            index: bones.findIndex(bone => bone.name === 'upper_armR'),
            rotationMin: new THREE.Vector3(-Math.PI/2, -Math.PI/2, 0.1),
            rotationMax: new THREE.Vector3(-0.1, Math.PI/2, Math.PI/2)
          }
        ],
      }
    ]

    ikSolverRef.current = new CCDIKSolver(mesh, ikChain)
    ikHelperRef.current = new CCDIKHelper(mesh, ikChain, 0.05)
    ikHelperRef.current.visible = true
    parentRef.current?.add(ikHelperRef.current)
  }, [nodes, scene])

  
  useEffect(() => { // Set material properties
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
  
  useEffect(() => { // Rotate waist to match orientation
    if (nodes['spine002'] != null) {
      const newQuaternion = (new THREE.Quaternion()).setFromAxisAngle(new THREE.Vector3(0, 1, 0), orientation)
      nodes['spine002'].quaternion.copy(newQuaternion)
    }
  }, [orientation, nodes['spine002']])
  
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

  useFrame(() => { // Control character with tracking
    if (rightControllerRef.current) {
      nodes['ikhandR'].position.copy(
        rightControllerRef.current?.getWorldPosition(new THREE.Vector3()).applyAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI).multiplyScalar(2)
      )
      nodes['ikhandR'].quaternion.copy(
        rightControllerRef.current?.getWorldQuaternion(new THREE.Quaternion()).premultiply(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), Math.PI))
      )
      nodes['ikhandR'].updateMatrixWorld(true) // Force matrix update

      if (ikSolverRef.current) {
        ikSolverRef.current.update()
      }
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
  
  return (
    <>
      <group ref={parentRef} >
        <axesHelper args={[1]} position={nodes['upper_armR'].getWorldPosition(new THREE.Vector3())} quaternion={nodes['upper_armR'].getWorldQuaternion(new THREE.Quaternion())} />
      </group>
      <group {...props} ref={CharacterOrigin} position={CHARACTER_ORIGIN} rotation={[0, 0, 0]} dispose={null}>
        <group rotation={[0, Math.PI, 0]}>
          <primitive object={scene} scale={scale} userData={{ isCharacter: true }} />
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