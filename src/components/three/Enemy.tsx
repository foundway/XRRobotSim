import { Group, Vector3, Quaternion, SkinnedMesh, Mesh, Object3D } from 'three'
import { useEffect, useRef, useMemo, useState} from 'react'
import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { RigidBody, RigidBodyProps, useFixedJoint, useRapier } from '@react-three/rapier'
import { Root, Text } from '@react-three/uikit'
import { Geometry, SkeletonUtils } from 'three-stdlib'
import { useAnimationStore } from '@/store/AnimationStore'

interface EnemyProps {
  initialPosition?: Vector3
  id?: string
}

export const Enemy = ({ initialPosition, id, ...props }: EnemyProps) => {  
  const modelUrl = 'alien-drone.glb'
  const { scene } = useGLTF(modelUrl)
  const headClone = SkeletonUtils.clone(scene.getObjectByName('Head') as Object3D)
  const tailClone = SkeletonUtils.clone(scene.getObjectByName('Tail') as Object3D)
  const rightHandClone = SkeletonUtils.clone(scene.getObjectByName('RightHand') as Object3D)
  const leftHandClone = SkeletonUtils.clone(scene.getObjectByName('LeftHand') as Object3D)
  const group = useRef<Group>(null)
  const rigidBodyRef = useRef<any>(null)
  const headRigidBodyRef = useRef<any>(null)
  const tailRigidBodyRef = useRef<any>(null)
  const rightHandRigidBodyRef = useRef<any>(null)
  const leftHandRigidBodyRef = useRef<any>(null)
  const uiGroupRef = useRef<Group>(null)
  const hp = useRef(100)
  const stunStartTime = useRef(0)
  const { characterPosition } = useAnimationStore()
  const [isStunned, setIsStunned] = useState(false)
  const [jointsEnabled, setJointsEnabled] = useState(true)
  const { world: rapierWorld } = useRapier();

  const ENEMY_ORIGIN = initialPosition || new Vector3(0, 4, -5) // Use provided position or default
  const MOVE_SPEED = 0.5 // Speed at which enemy moves toward character
  const STUN_DURATION = 1 // Stun duration in seconds
  const CHARACTER_HEIGHT = new Vector3(0, 2, 0)

  const headTailJoint = useFixedJoint(headRigidBodyRef, tailRigidBodyRef, [
    [0, 0, 0], [0, 0, 0, 1],
    [0, 0, 0], [0, 0, 0, 1]
  ]);
  const headRightHandJoint = useFixedJoint(headRigidBodyRef, rightHandRigidBodyRef, [
    [0, 0, 0], [0, 0, 0, 1],
    [0, 0, 0], [0, 0, 0, 1]
  ]);
  const headLeftHandJoint = useFixedJoint(headRigidBodyRef, leftHandRigidBodyRef, [
    [0, 0, 0], [0, 0, 0, 1],
    [0, 0, 0], [0, 0, 0, 1]
  ]);

  useEffect(() => {
  }, [headTailJoint, headRightHandJoint, headLeftHandJoint])

  const handleCollision = (event: any) => {
    if (!event.other.rigidBodyObject) return
    if (!event.other.rigidBodyObject.userData?.isCharacterHand) return
    if (isStunned) return
    
    setIsStunned(true)
    stunStartTime.current = Date.now()
    hp.current -= 30
    destroyed()
  }
  
  const destroyed = () => {
    if (!headTailJoint.current || !headRightHandJoint.current || !headLeftHandJoint.current) return
    rapierWorld.removeImpulseJoint(headTailJoint.current, true);
    rapierWorld.removeImpulseJoint(headRightHandJoint.current, true);
    rapierWorld.removeImpulseJoint(headLeftHandJoint.current, true);
  }
  
  useEffect(() => {
    if (isStunned) {
      const checkStunEnd = () => {
        if (Date.now() - stunStartTime.current >= STUN_DURATION * 1000) {
          setIsStunned(false)
        }
      }
      const interval = setInterval(checkStunEnd, 100)
      return () => clearInterval(interval)
    }
  }, [isStunned, id])

  const updateUI = (state: any) => {
    if (uiGroupRef.current) {
      const cameraWorldQuat = state.camera.getWorldQuaternion(new Quaternion());
      if (uiGroupRef.current.parent) {
        const parentWorldQuat = uiGroupRef.current.parent.getWorldQuaternion(new Quaternion());
        parentWorldQuat.invert();
        uiGroupRef.current.quaternion.copy(cameraWorldQuat).premultiply(parentWorldQuat);
      } else {
        uiGroupRef.current.quaternion.copy(cameraWorldQuat);
      }
    }
  }

  const updateSteering = () => {
    if (!headRigidBodyRef.current) return
    if (isStunned) return

    const enemyPosition = headRigidBodyRef.current.translation()
    const enemyPos = new Vector3(enemyPosition.x, enemyPosition.y, enemyPosition.z)
    const direction = characterPosition.clone().add(CHARACTER_HEIGHT).sub(enemyPos).normalize()
    
    headRigidBodyRef.current.setLinvel(direction.multiplyScalar(MOVE_SPEED), true)

    // Make enemy face the character with some smoothing
    if (direction.length() > 0.1) {
      const targetRotation = new Quaternion().setFromUnitVectors(
        new Vector3(0, 0, 1), // Forward direction
        direction
      )
      
      // Smooth rotation
      const currentRotation = headRigidBodyRef.current.rotation()
      const currentQuat = new Quaternion(currentRotation.x, currentRotation.y, currentRotation.z, currentRotation.w)
      currentQuat.slerp(targetRotation, 0.5)
      headRigidBodyRef.current.setRotation(currentQuat, true)
    }
  }

  useFrame((state) => {
    updateUI(state)
    updateSteering()
  })

  const rigidBodyConfig: RigidBodyProps = {
    colliders: "ball",
    mass: 1000,
    friction: 0.7,
    restitution: 0.1,
    linearDamping: 0.8,
    angularDamping: 0.8,
    gravityScale: 0,
    onCollisionEnter: handleCollision,
    userData: { isEnemy: true, enemyId: id }
  }

  return (
    <group ref={group} dispose={null} key={id}>


      <RigidBody
        ref={headRigidBodyRef}
        name="head"
        position={ENEMY_ORIGIN}
        {...rigidBodyConfig}
      >
        <primitive object={headClone} scale={1} />
        <group ref={uiGroupRef}>
        <Root pixelSize={0.01} depthTest={false} depthWrite={false} >
          <Text fontSize={10} color="white">
            HP: {hp.current}
          </Text>
        </Root>
      </group>
      </RigidBody>

      {/* Tail rigid body */}
      <RigidBody
        ref={tailRigidBodyRef}
        position={ENEMY_ORIGIN}
        sensor={true}
        {...rigidBodyConfig}
      >
        <primitive object={tailClone} scale={1} />
      </RigidBody>

      {/* Right Hand rigid body */}
      <RigidBody
        ref={rightHandRigidBodyRef}
        position={ENEMY_ORIGIN}
        sensor={true}
        {...rigidBodyConfig}
      >
        <primitive object={rightHandClone} scale={1} />
      </RigidBody>

      {/* Left Hand rigid body */}
      <RigidBody
        ref={leftHandRigidBodyRef}
        position={ENEMY_ORIGIN}
        sensor={true}
        {...rigidBodyConfig}
      >
        <primitive object={leftHandClone} scale={1} />
      </RigidBody>
    </group>
  )
} 