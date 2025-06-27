import { Group, Vector3, Quaternion, SkinnedMesh, Mesh, Object3D } from 'three'
import { useEffect, useRef, useMemo, useState} from 'react'
import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { RigidBody, RigidBodyProps, useFixedJoint, useRapier } from '@react-three/rapier'
import { Root, Text } from '@react-three/uikit'
import { Geometry, SkeletonUtils } from 'three-stdlib'
import { useAnimationStore } from '@/store/AnimationStore'

enum EnemyState {
  ALIVE,
  STUNNED,
  DESTROYED,
  REMOVED
}

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
  const headRigidBodyRef = useRef<any>(null)
  const tailRigidBodyRef = useRef<any>(null)
  const rightHandRigidBodyRef = useRef<any>(null)
  const leftHandRigidBodyRef = useRef<any>(null)
  const uiGroupRef = useRef<Group>(null)
  const hp = useRef(100)
  const stunStartTime = useRef(0)
  const destroyedStartTime = useRef(0)
  const { characterPosition } = useAnimationStore()
  const [enemyState, setEnemyState] = useState(EnemyState.ALIVE)
  const { world: rapierWorld } = useRapier();
  const scaleRef = useRef(1)
  const [isRemoved, setIsRemoved] = useState(false)

  const ENEMY_ORIGIN = initialPosition || new Vector3(0, 4, -5) // Use provided position or default
  const MOVE_SPEED = 0.5 // Speed at which enemy moves toward character
  const STUN_DURATION = 1 // Stun duration in seconds
  const CHARACTER_HEIGHT = new Vector3(0, 2, 0)
  const DESTROYED_DURATION = 1 // Destroyed duration in seconds

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

  const handleCollision = (event: any) => {
    if (!event.other.rigidBodyObject) return
    if (!event.other.rigidBodyObject.userData?.isCharacterHand) return
    if (enemyState === EnemyState.STUNNED) return
    
    setEnemyState(EnemyState.STUNNED)
    stunStartTime.current = Date.now()
    hp.current -= 100
    if (hp.current <= 0) {
      destroyed()
    }
  }
  
  const destroyed = () => {
    setEnemyState(EnemyState.DESTROYED)
    destroyedStartTime.current = Date.now()
    if (!headTailJoint.current || !headRightHandJoint.current || !headLeftHandJoint.current) return
    rapierWorld.removeImpulseJoint(headTailJoint.current, true);
    rapierWorld.removeImpulseJoint(headRightHandJoint.current, true);
    rapierWorld.removeImpulseJoint(headLeftHandJoint.current, true);
    tailRigidBodyRef.current.setSensor(false)
    rightHandRigidBodyRef.current.setSensor(false)
    leftHandRigidBodyRef.current.setSensor(false)
    tailRigidBodyRef.current.setGravityScale(9.8)
    rightHandRigidBodyRef.current.setGravityScale(9.8)
    leftHandRigidBodyRef.current.setGravityScale(9.8)
  }
  
  useEffect(() => {
    if (enemyState === EnemyState.STUNNED) {
      const checkStunEnd = () => {
        if (Date.now() - stunStartTime.current >= STUN_DURATION * 1000) {
          setEnemyState(EnemyState.ALIVE)
        }
      }
      const interval = setInterval(checkStunEnd, 100)
      return () => clearInterval(interval)
    } else if (enemyState === EnemyState.DESTROYED) {
      const checkDestroyedEnd = () => {
        if (Date.now() - destroyedStartTime.current >= DESTROYED_DURATION * 1000) {
          setEnemyState(EnemyState.REMOVED)
        }
      }
      const interval = setInterval(checkDestroyedEnd, 100)
      return () => clearInterval(interval)
    }
  }, [enemyState, id])

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
    if (enemyState !== EnemyState.ALIVE) return;
    if (!headRigidBodyRef.current) return;

    const enemyPosition = headRigidBodyRef.current.translation();
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
    gravityScale: enemyState === EnemyState.ALIVE ? 0 : 1,
    onCollisionEnter: handleCollision,
    userData: { isEnemy: true, enemyId: id }
  }

  return (
    <group ref={group} dispose={null} key={id}>
      {enemyState !== EnemyState.REMOVED && (
        <>
          <RigidBody
            ref={headRigidBodyRef}
            name="head"
            position={ENEMY_ORIGIN}
            {...rigidBodyConfig}
          >
            <primitive object={headClone}/>
            <group ref={uiGroupRef}>
              <Root pixelSize={0.01} depthTest={false} depthWrite={false} >
                <Text fontSize={10} color="white">
                  HP: {hp.current}
                </Text>
              </Root>
            </group>
          </RigidBody>

          <RigidBody
            ref={tailRigidBodyRef}
            position={ENEMY_ORIGIN}
            sensor={enemyState === EnemyState.ALIVE}
            {...rigidBodyConfig}
          >
            <primitive object={tailClone}/>
          </RigidBody>

          <RigidBody
            ref={rightHandRigidBodyRef}
            position={ENEMY_ORIGIN}
            sensor={enemyState === EnemyState.ALIVE}
            {...rigidBodyConfig}
          >
            <primitive object={rightHandClone}/>
          </RigidBody>

          <RigidBody
            ref={leftHandRigidBodyRef}
            position={ENEMY_ORIGIN}
            sensor={enemyState === EnemyState.ALIVE}
            {...rigidBodyConfig}
          >
            <primitive object={leftHandClone}/>
          </RigidBody>
        </>
      )}
    </group>
  )
} 