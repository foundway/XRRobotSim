import { Mesh, BoxGeometry, MeshBasicMaterial, Vector3, Quaternion, SkinnedMesh, Object3D, Euler } from 'three'
import { CCDIKSolver, CCDIKHelper } from 'three/addons/animation/CCDIKSolver.js';
import { JSX, useEffect, useRef, useState, useMemo } from 'react'
import { useGLTF, useAnimations } from '@react-three/drei'
import { useModels } from '@/context/AppContext'
import { useModelStore } from '@/store/ModelStore'
import { useAnimationStore } from '@/store/AnimationStore'
import { GameMode, useSceneStore } from '@/store/SceneStore'
import { useFrame } from '@react-three/fiber'
import { useXRInputSourceState } from '@react-three/xr'
import { RigidBody, BallCollider, CuboidCollider } from '@react-three/rapier'
import { SparksEmitter } from './SparksEmitter'
import { DEBUG } from '@/App'
import { MAX_PHYSICS_SPEED } from './Scene'

const DEADZONE = 0.3
const LOCOMOTION_TRANSITION_SECONDS = 0.0
const VECTOR_UP = new Vector3(0, 1, 0)
const HAND_LENGTH_MULTIPLIER = 2

enum LocomotionCommand {
  Idle = 'Idle',
  Forward = 'Forward', 
  Backward = 'Backward',
  TurnRight = 'TurnRight',
  TurnLeft = 'TurnLeft'
}

interface SparksData {
  id: string
  position: Vector3
  velocity: Vector3
}

export const Character = (props: JSX.IntrinsicElements['group']) => {  
  const lastCycleTime = useRef(0)
  const [sparksInstances, setSparksInstances] = useState<SparksData[]>([])
  const { characterPosition, characterOrientation, } = useAnimationStore()

  const rightController = useXRInputSourceState('controller', 'right')
  const { currentModel } = useModels()
  const { scene, nodes, animations } = useGLTF(currentModel.url)
  const parentRef = useRef<Object3D>(null)
  const chestRef = useRef<Object3D | null>(null)
  const characterRef = useRef<Object3D>(null)
  const { globalScale, playerScaleRef, rightControllerRef, leftControllerRef, gameMode } = useSceneStore()

  const ikBoneNames = useMemo(() => [
    'shoulderR', 'upper_armR', 'forearmR', 'handR',
    'shoulderL', 'upper_armL', 'forearmL', 'handL'
  ], []);

  const animationsWithoutIKBones = useMemo(() => {
    return animations.map(clip => {
      const newClip = clip.clone();
      newClip.tracks = clip.tracks.filter(track => {
        const boneName = track.name.split('.')[0];
        return !ikBoneNames.includes(boneName);
      });
      return newClip;
    });
  }, [animations, ikBoneNames]);

  const { actions } = useAnimations(gameMode == GameMode.None ? animations : animationsWithoutIKBones, characterRef)
  const [currentAction, setCurrentAction] = useState(actions.Scan)
  const ikSolverRef = useRef<CCDIKSolver | null>(null)
  const ikHelperRef = useRef<CCDIKHelper | null>(null)
  const skinnedMeshRef = useRef<SkinnedMesh | null>(null)
  const rightHandRigidBodyRef = useRef<any>(null)
  const leftHandRigidBodyRef = useRef<any>(null)
  const bodyRigidBodyRef = useRef<any>(null)
  const { scale } = useModelStore()
  const { cockpitRef, xrOriginRef } = useSceneStore()

  useEffect(() => { // Add placeholder box to head joint
    if (!DEBUG) return
    if (nodes.head) {
      const box = new Mesh(
        new BoxGeometry(0.2, 0.4, 0.2),
        new MeshBasicMaterial({ color: 'green', wireframe: true })
      )
      box.position.set(0, 0.2, 0) // Position slightly above the head
      nodes.head.add(box)
    }
  }, [nodes.head])

  useEffect(() => { // Find the skinned mesh in the model
    scene.traverse((child) => {
      if (child instanceof SkinnedMesh) {
        skinnedMeshRef.current = child
        child.frustumCulled = false
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
    if (DEBUG) {
      ikHelperRef.current = new CCDIKHelper(mesh, ikChain, 0.05)
      ikHelperRef.current.visible = true
      playerScaleRef.current?.add(ikHelperRef.current)
    }
  }, [nodes, scene])

  useEffect(() => {
    if (gameMode == GameMode.None) {
      actions.Scan?.play()
      setCurrentAction(actions.Scan)
    } else {
      actions.Idle?.play()
      setCurrentAction(actions.Idle)
    }
    return () => {
      currentAction?.fadeOut(LOCOMOTION_TRANSITION_SECONDS)
    }
  }, [actions, gameMode])

  const lastRootPosition = useRef(nodes.root.position.clone())
  const lastRootOrientation = useRef(characterOrientation)
  const locomotionUpdate = () => {
    if (!currentAction || gameMode == GameMode.None) {
      return
    }
    const rightStick = rightController?.gamepad['xr-standard-thumbstick']
    const y = rightStick?.yAxis || 0
    const x = rightStick?.xAxis || 0
    let command

    if (y < -DEADZONE) {
      command = LocomotionCommand.Forward
    } else if (y > DEADZONE) {
      command = LocomotionCommand.Backward
    } else if (x > DEADZONE) {
      command = LocomotionCommand.TurnRight
    } else if (x < -DEADZONE) {
      command = LocomotionCommand.TurnLeft
    } else {
      command = LocomotionCommand.Idle
    }

    if (lastCycleTime.current > currentAction.time) {
      if (characterRef.current) {
        characterRef.current.position.add(lastRootPosition.current.applyQuaternion(characterRef.current.quaternion))
        characterRef.current.rotateOnAxis(VECTOR_UP, lastRootOrientation.current)
      } 
    }
    if (command == LocomotionCommand.Forward && !actions.Forward?.isRunning()) {
      currentAction?.fadeOut(LOCOMOTION_TRANSITION_SECONDS)
      actions.Forward?.reset().fadeIn(LOCOMOTION_TRANSITION_SECONDS).play()
      setCurrentAction(actions.Forward)
    } 
    else if (command == LocomotionCommand.Backward && !actions.Backward?.isRunning()) {
      currentAction?.fadeOut(LOCOMOTION_TRANSITION_SECONDS)
      actions.Backward?.reset().fadeIn(LOCOMOTION_TRANSITION_SECONDS).play()
      setCurrentAction(actions.Backward)
    } 
    else if (command == LocomotionCommand.TurnRight && !actions.TurnRight?.isRunning()) {
      currentAction?.fadeOut(LOCOMOTION_TRANSITION_SECONDS)
      actions.TurnRight?.reset().fadeIn(LOCOMOTION_TRANSITION_SECONDS).play()
      setCurrentAction(actions.TurnRight)
    } 
    else if (command == LocomotionCommand.TurnLeft && !actions.TurnLeft?.isRunning()) {
      currentAction?.fadeOut(LOCOMOTION_TRANSITION_SECONDS)
      actions.TurnLeft?.reset().fadeIn(LOCOMOTION_TRANSITION_SECONDS).play()
      setCurrentAction(actions.TurnLeft)
    }
    else if (command == LocomotionCommand.Idle && !actions.Idle?.isRunning() && lastCycleTime.current > currentAction.time) {
      currentAction?.fadeOut(LOCOMOTION_TRANSITION_SECONDS)
      actions.Idle?.reset().fadeIn(LOCOMOTION_TRANSITION_SECONDS).play()
      setCurrentAction(actions.Idle)
    }
    lastRootPosition.current = nodes.root.position.clone()
    lastRootOrientation.current = nodes.root.rotation.z
    lastCycleTime.current = currentAction.time
  }

  const ikUpdate = () => {
    if (!cockpitRef.current) return

    if (chestRef.current) {
      chestRef.current.position.copy(nodes.chest.getWorldPosition(new Vector3()).multiplyScalar(1/globalScale))
      chestRef.current.quaternion.copy(nodes.chest.getWorldQuaternion(new Quaternion()))
    }

    if (rightControllerRef.current) {
      const controllerWorldPos = rightControllerRef.current.getWorldPosition(new Vector3())
      const controllerWorldQuat = rightControllerRef.current.getWorldQuaternion(new Quaternion())
      
      const cockpitWorldMatrix = cockpitRef.current.matrixWorld.clone().invert()
      const localPos = controllerWorldPos.clone().applyMatrix4(cockpitWorldMatrix)
      const localQuat = controllerWorldQuat.clone().premultiply(cockpitRef.current.getWorldQuaternion(new Quaternion()).invert())
      
      nodes.ikhandR.position.copy(localPos.multiplyScalar(HAND_LENGTH_MULTIPLIER))
      nodes.ikhandR.quaternion.copy(localQuat)
    }

    if (leftControllerRef.current) {
      const controllerWorldPos = leftControllerRef.current.getWorldPosition(new Vector3())
      const controllerWorldQuat = leftControllerRef.current.getWorldQuaternion(new Quaternion())
      
      const cockpitWorldMatrix = cockpitRef.current.matrixWorld.clone().invert()
      const localPos = controllerWorldPos.clone().applyMatrix4(cockpitWorldMatrix)
      const localQuat = controllerWorldQuat.clone().premultiply(cockpitRef.current.getWorldQuaternion(new Quaternion()).invert())
      
      nodes.ikhandL.position.copy(localPos.multiplyScalar(HAND_LENGTH_MULTIPLIER))
      nodes.ikhandL.quaternion.copy(localQuat)
    }
    if (ikSolverRef.current && gameMode != GameMode.None) {
      ikSolverRef.current.update()
    }
  }
  
  const RBDUpdate = () => {
    if (nodes.handR && rightHandRigidBodyRef.current) {
      const handWorldPos = nodes.palm02R.getWorldPosition(new Vector3())
      const handWorldQuat = nodes.palm02R.getWorldQuaternion(new Quaternion())
      rightHandRigidBodyRef.current.setNextKinematicTranslation(handWorldPos)
      rightHandRigidBodyRef.current.setNextKinematicRotation(handWorldQuat)
    }
    
    if (nodes.handL && leftHandRigidBodyRef.current) {
      const handWorldPos = nodes.palm02L.getWorldPosition(new Vector3())
      const handWorldQuat = nodes.palm02L.getWorldQuaternion(new Quaternion())
      leftHandRigidBodyRef.current.setNextKinematicTranslation(handWorldPos)
      leftHandRigidBodyRef.current.setNextKinematicRotation(handWorldQuat)
    }
    if (nodes.hip && bodyRigidBodyRef.current) {
      bodyRigidBodyRef.current.setNextKinematicTranslation(nodes.hip.getWorldPosition(new Vector3()))
      bodyRigidBodyRef.current.setNextKinematicRotation(nodes.hip.getWorldQuaternion(new Quaternion()))
    }
  } 

  useFrame(() => { 
    locomotionUpdate()
    ikUpdate()
    RBDUpdate()
    if (xrOriginRef.current && gameMode == GameMode.TwentyMeterMounted) {
      xrOriginRef.current.position.copy(nodes.head.getWorldPosition(new Vector3()).add(new Vector3(0, 0, 0)))
      xrOriginRef.current.quaternion.copy(nodes.head.getWorldQuaternion(new Quaternion()))  
      xrOriginRef.current.rotateOnAxis(new Vector3(0, 1, 0), Math.PI)
    }
  })

  const handleCollision = (event: any) => {
    if (!event.other.rigidBody.userData.isEnemy) return
    const vel = new Vector3().copy(event.target.rigidBody.linvel())
    if (vel.length() > MAX_PHYSICS_SPEED * globalScale) {
      vel.normalize().multiplyScalar(MAX_PHYSICS_SPEED * globalScale)
    }
    const newSparks: SparksData = {
      id: `sparks-${Date.now()}-${Math.random()}`,
      position: new Vector3().copy(event.target.rigidBody.translation()),
      velocity: vel
    }
    setSparksInstances(prev => [...prev, newSparks])
  }

  return (
    <>
      <group {...props} ref={characterRef} position={characterPosition} rotation={[0, characterOrientation, 0]}>
        <primitive object={scene} scale={scale} userData={{ isCharacter: true }} />
        <CuboidCollider args={[10, 1, 10]} position={[0, -0.5, 0]}/>
      </group>
      <RigidBody
        ref={bodyRigidBodyRef}
        name="body"
        type="kinematicPosition"
      >
        <CuboidCollider args={[0.4, 1.1, 0.4]} />
      </RigidBody>
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
      {sparksInstances.map((sparks) => (
        <SparksEmitter key={sparks.id} position={sparks.position} velocity={sparks.velocity} />
      ))}
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

useGLTF.preload('kanonenkopf-kampfpanzer-rigged.glb')