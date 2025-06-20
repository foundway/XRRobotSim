import { Group, Mesh, BoxGeometry, MeshBasicMaterial, MeshPhysicalMaterial, Vector3, Quaternion, SkinnedMesh, FrontSide, Object3D} from 'three'
import { CCDIKSolver, CCDIKHelper } from 'three/addons/animation/CCDIKSolver.js';
import React, { JSX, useEffect, useRef, useState } from 'react'
import { useGLTF, useAnimations } from '@react-three/drei'
import { useModels } from '@/context/AppContext'
import { useModelStore } from '@/store/ModelStore'
import { useAnimationStore } from '@/store/AnimationStore'
import { useSceneStore } from '@/store/SceneStore'
import { useFrame } from '@react-three/fiber'
import { useXRInputSourceState, XRSpace } from '@react-three/xr'
import { useRapier, RigidBody, BallCollider } from '@react-three/rapier'
import { SparksEmitter } from './SparksEmitter'

interface SparksData {
  id: string
  position: Vector3
  direction: Vector3
}

export const Character = (props: JSX.IntrinsicElements['group']) => {  
  const { currentAnimation, setCurrentAnimation, setAnimations, orientation } = useAnimationStore()
  const { scale } = useModelStore()
  const { currentModel } = useModels()
  const { cockpitRef } = useSceneStore()
  const rightController = useXRInputSourceState('controller', 'right')
  const leftController = useXRInputSourceState('controller', 'left')
  const modelUrl = currentModel.url
  const { scene, nodes, animations } = useGLTF(modelUrl)
  const group = React.useRef<Group>(null)
  const parentRef = React.useRef<Object3D>(null)
  const rightControllerRef = React.useRef<Object3D | null>(null)
  const leftControllerRef = React.useRef<Object3D | null>(null)
  const chestRef = React.useRef<Object3D | null>(null)
  const { actions } = useAnimations(animations, group)
  const CharacterOrigin = useRef<Object3D>(null)
  const UNSET_ROUGHNESS = 1
  const UNSET_THICKNESS = 0
  const FALLBACK_ROUGHNESS = 0.1 
  const FALLBACK_THICKNESS = 1
  const CHARACTER_ORIGIN = new Vector3(0, 0, -3)
  const ikSolverRef = useRef<CCDIKSolver | null>(null)
  const ikHelperRef = useRef<CCDIKHelper | null>(null)
  const skinnedMeshRef = useRef<SkinnedMesh | null>(null)
  const rightHandRigidBodyRef = useRef<any>(null)
  const leftHandRigidBodyRef = useRef<any>(null)
  const [sparksInstances, setSparksInstances] = useState<SparksData[]>([])
  const SPARKS_VELOCITY_SCALE = 0.3

  useEffect(() => { // Add placeholder box to head joint
    if (nodes['head']) {
      const box = new Mesh(
        new BoxGeometry(0.2, 0.4, 0.2),
        new MeshBasicMaterial({ color: 'blue', wireframe: true })
      )
      box.position.set(0, 0.2, 0) // Position slightly above the head
      nodes['head'].add(box)
    }
  }, [nodes['head']])

  useEffect(() => { // Find the skinned mesh in the model
    scene.traverse((child) => {
      if (child instanceof SkinnedMesh) {
        skinnedMeshRef.current = child
      }
    })
  }, [scene])

  useEffect(() => { // Set up IK solver
    if (!skinnedMeshRef.current) return

    const mesh = skinnedMeshRef.current
    const bones = mesh.skeleton.bones
    const ikChain = [
      {
        target: bones.findIndex(bone => bone.name === 'ikhandR'),
        effector: bones.findIndex(bone => bone.name === 'handR'),
        links: [
          {
            index: bones.findIndex(bone => bone.name === 'forearmR'),
            rotationMin: new Vector3(0, 0, 0.1),
            rotationMax: new Vector3(0, 0, 2),
          }, {
            index: bones.findIndex(bone => bone.name === 'upper_armR'),
            rotationMin: new Vector3(-1.5, 0, -0.8),
            rotationMax: new Vector3(0.8, 0, 1.5),
          }, {
            index: bones.findIndex(bone => bone.name === 'shoulderR'),
            rotationMin: new Vector3(0, -1.5, 0),
            rotationMax: new Vector3(0, 1.5, 0),
          }
        ],
      },
      {
        target: bones.findIndex(bone => bone.name === 'ikhandL'),
        effector: bones.findIndex(bone => bone.name === 'handL'),
        links: [
          {
            index: bones.findIndex(bone => bone.name === 'forearmL'),
            rotationMin: new Vector3(0, 0, -2),
            rotationMax: new Vector3(0, 0, -0.1),
          }, {
            index: bones.findIndex(bone => bone.name === 'upper_armL'),
            rotationMin: new Vector3(-1.5, 0, -1.5),
            rotationMax: new Vector3(0.8, 0, 0.8),
          }, {
            index: bones.findIndex(bone => bone.name === 'shoulderL'),
            rotationMin: new Vector3(0, -1.5, 0),
            rotationMax: new Vector3(0, 1.5, 0),
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
      if (child instanceof Mesh && child.material instanceof MeshPhysicalMaterial && child.material.transmission > 0) {
        child.material.transparent = false
        if (child.material.roughness == UNSET_ROUGHNESS) {
          child.material.roughness = FALLBACK_ROUGHNESS
        }
        if (child.material.thickness == UNSET_THICKNESS) {
          child.material.thickness = FALLBACK_THICKNESS
        }
        child.material.side = FrontSide
      }
    })
  }, [scene])
  
  useEffect(() => { // Rotate waist to match orientation
    if (nodes['waist'] != null) {
      const newQuaternion = (new Quaternion()).setFromAxisAngle(new Vector3(0, 1, 0), orientation)
      nodes['waist'].quaternion.copy(newQuaternion)
    }
  }, [orientation, nodes['waist']])
  
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

  const ikUpdate = () => {
    if (!cockpitRef.current) return

    if (chestRef.current) {
      chestRef.current.position.copy(nodes['chest'].getWorldPosition(new Vector3()))
      chestRef.current.quaternion.copy(nodes['chest'].getWorldQuaternion(new Quaternion()))
    }

    if (rightControllerRef.current) {
      const controllerWorldPos = rightControllerRef.current.getWorldPosition(new Vector3())
      const controllerWorldQuat = rightControllerRef.current.getWorldQuaternion(new Quaternion())
      
      const cockpitWorldMatrix = cockpitRef.current.matrixWorld.clone().invert()
      const localPos = controllerWorldPos.clone().applyMatrix4(cockpitWorldMatrix)
      const localQuat = controllerWorldQuat.clone().premultiply(cockpitRef.current.getWorldQuaternion(new Quaternion()).invert())
      
      nodes['ikhandR'].position.copy(localPos.multiplyScalar(2))
      nodes['ikhandR'].quaternion.copy(localQuat)
    }

    if (leftControllerRef.current) {
      const controllerWorldPos = leftControllerRef.current.getWorldPosition(new Vector3())
      const controllerWorldQuat = leftControllerRef.current.getWorldQuaternion(new Quaternion())
      
      const cockpitWorldMatrix = cockpitRef.current.matrixWorld.clone().invert()
      const localPos = controllerWorldPos.clone().applyMatrix4(cockpitWorldMatrix)
      const localQuat = controllerWorldQuat.clone().premultiply(cockpitRef.current.getWorldQuaternion(new Quaternion()).invert())
      
      nodes['ikhandL'].position.copy(localPos.multiplyScalar(2))
      nodes['ikhandL'].quaternion.copy(localQuat)
    }
    ikSolverRef.current?.update()
  }
  
  const handRBDUpdate = () => {
    if (nodes['handR'] && rightHandRigidBodyRef.current) {
      const handWorldPos = nodes['palm02R'].getWorldPosition(new Vector3())
      rightHandRigidBodyRef.current.setNextKinematicTranslation(handWorldPos)
    }
    
    if (nodes['handL'] && leftHandRigidBodyRef.current) {
      const handWorldPos = nodes['palm02L'].getWorldPosition(new Vector3())
      leftHandRigidBodyRef.current.setNextKinematicTranslation(handWorldPos)
    }
  } 

  useFrame(() => { 
    ikUpdate()
    handRBDUpdate()
  })

  const handleCollision = (event: any) => {
    if (event.other.rigidBody.userData.isEnemy) {
      const newSparks: SparksData = {
        id: `sparks-${Date.now()}-${Math.random()}`,
        position: new Vector3().copy(event.target.rigidBody.translation()),
        direction: new Vector3().copy(event.target.rigidBody.linvel())
      }
      setSparksInstances(prev => [...prev, newSparks])
    }
  }

  return (
    <>
      <group {...props} ref={CharacterOrigin} position={CHARACTER_ORIGIN} rotation={[0, 0, 0]} dispose={null}>
        <group rotation={[0, Math.PI, 0]}>
          <primitive object={scene} scale={scale} userData={{ isCharacter: true }} />
          <RigidBody 
            ref={rightHandRigidBodyRef}
            mass={1}
            friction={0.7}
            restitution={0.9}
            type="kinematicPosition"
            userData={{ isCharacterHand: true, hand: 'right' }}
            onCollisionEnter={handleCollision}
          >
            <BallCollider args={[0.2]} />
          </RigidBody>

          <RigidBody 
            ref={leftHandRigidBodyRef}
            mass={1}
            friction={0.7}
            restitution={0.9}
            type="kinematicPosition"
            userData={{ isCharacterHand: true, hand: 'left' }}
            onCollisionEnter={handleCollision}
          >
            <BallCollider args={[0.2]} />
          </RigidBody>
        </group>
      </group>
      {sparksInstances.map((sparks) => (
        <SparksEmitter key={sparks.id} position={sparks.position} direction={sparks.direction} />
      ))}

      {rightController?.inputSource?.targetRaySpace && ( // Get controller transform in target ray space. TODO: There might be a better way to do this.
        <XRSpace ref={rightControllerRef} space={rightController.inputSource.targetRaySpace}/>
      )}
      {leftController?.inputSource?.targetRaySpace && ( // Get controller transform in target ray space. TODO: There might be a better way to do this.
        <XRSpace ref={leftControllerRef} space={leftController.inputSource.targetRaySpace}/>
      )}
      <mesh ref={chestRef}>
        <boxGeometry args={[1, 0, 1]} />
        <meshBasicMaterial color="blue" wireframe={true} />
      </mesh>

      <group ref={parentRef} >
        {/* <axesHelper args={[0.5]} 
          position={nodes['forearmL'].getWorldPosition(new Vector3())} 
          quaternion={nodes['forearmL'].getWorldQuaternion(new Quaternion())} 
        />
        <axesHelper args={[0.5]} 
          position={nodes['upper_armL'].getWorldPosition(new Vector3())} 
          quaternion={nodes['upper_armL'].getWorldQuaternion(new Quaternion())} 
        />
        <axesHelper args={[0.5]} 
          position={nodes['forearmR'].getWorldPosition(new Vector3())} 
          quaternion={nodes['forearmR'].getWorldQuaternion(new Quaternion())} 
        />
        <axesHelper args={[0.5]} 
          position={nodes['upper_armR'].getWorldPosition(new Vector3())} 
          quaternion={nodes['upper_armR'].getWorldQuaternion(new Quaternion())} 
        />
        <axesHelper args={[0.5]} 
          position={nodes['shoulderR'].getWorldPosition(new Vector3())} 
          quaternion={nodes['shoulderR'].getWorldQuaternion(new Quaternion())} 
        /> */}
      </group>

    </>
  )
}