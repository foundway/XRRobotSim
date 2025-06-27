import { Group, Vector3, Quaternion, SkinnedMesh, Mesh, Object3D, MathUtils } from 'three'
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
  const remainingForce = useRef(new Vector3())
  const rightHandRigidBodyRef = useRef<any>(null)
  const leftHandRigidBodyRef = useRef<any>(null)
  const uiGroupRef = useRef<Group>(null)
  const hp = useRef(100)
  const stunStartTime = useRef(0)
  const destroyedStartTime = useRef(0)
  const { characterPosition } = useAnimationStore()
  const [enemyState, setEnemyState] = useState(EnemyState.ALIVE)
  const { world: rapierWorld } = useRapier();

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

  const handleContactForce = (event: any) => {
    if (!event.other.rigidBodyObject) return;
    if (!event.other.rigidBodyObject.userData?.isCharacterHand) return;

    hp.current -= 100;
    if (hp.current > 0) {
      setEnemyState(EnemyState.STUNNED);
      stunStartTime.current = Date.now();
    } else {
      destroyed(event.totalForce);
    }
  }
  
  const destroyed = (force: Vector3) => {
    if (!headTailJoint.current || !headRightHandJoint.current || !headLeftHandJoint.current) return

    setEnemyState(EnemyState.DESTROYED)
    destroyedStartTime.current = Date.now()

    rapierWorld.removeImpulseJoint(headTailJoint.current, true);
    rapierWorld.removeImpulseJoint(headRightHandJoint.current, true);
    rapierWorld.removeImpulseJoint(headLeftHandJoint.current, true);

    headRigidBodyRef.current.setGravityScale(1)
    tailRigidBodyRef.current.setGravityScale(1)
    rightHandRigidBodyRef.current.setGravityScale(1)
    leftHandRigidBodyRef.current.setGravityScale(1)

    const randomVec = (mag = 0.1) => new Vector3().randomDirection().multiplyScalar(mag);
    const randomTorque = (mag = 0.5) => new Vector3().randomDirection().multiplyScalar(mag);

    headRigidBodyRef.current.applyImpulse(randomVec(), true)
    headRigidBodyRef.current.applyTorqueImpulse(randomTorque(), true)

    tailRigidBodyRef.current.setLinvel(headRigidBodyRef.current.linvel(), true)
    tailRigidBodyRef.current.setAngvel(headRigidBodyRef.current.angvel(), true)
    tailRigidBodyRef.current.applyImpulse(randomVec(), true)
    tailRigidBodyRef.current.applyTorqueImpulse(randomTorque(), true)
    
    rightHandRigidBodyRef.current.setLinvel(headRigidBodyRef.current.linvel(), true)
    rightHandRigidBodyRef.current.setAngvel(headRigidBodyRef.current.angvel(), true)
    rightHandRigidBodyRef.current.applyImpulse(randomVec(), true)
    rightHandRigidBodyRef.current.applyTorqueImpulse(randomTorque(), true)

    leftHandRigidBodyRef.current.setLinvel(headRigidBodyRef.current.linvel(), true)
    leftHandRigidBodyRef.current.setAngvel(headRigidBodyRef.current.angvel(), true)
    leftHandRigidBodyRef.current.applyImpulse(randomVec(), true)
    leftHandRigidBodyRef.current.applyTorqueImpulse(randomTorque(), true)

    remainingForce.current = force.clone()
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
    mass: 1,
    friction: 0.7,
    restitution: 0.1,
    linearDamping: 0.1,
    angularDamping: 0.1,
    gravityScale: enemyState === EnemyState.ALIVE ? 0 : 0.1,
    onContactForce: handleContactForce,
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