import { Group, Vector3, Quaternion } from 'three'
import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from 'react'
import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { RigidBody, BallCollider } from '@react-three/rapier'
import { Container, Root, Text } from '@react-three/uikit'
import { SkeletonUtils } from 'three-stdlib'
import { useAnimationStore } from '@/store/AnimationStore'
import { useSceneStore } from '@/store/SceneStore'
import { DebrisBurstEmitter, DebrisTimeEmitter } from './DebrisEmitter'

const STUN_DURATION = 1 
const DESTROYED_DURATION = 1 
const FORCE_DAMAGE_MULTIPLIER = 0.5
const ROTATE_SPEED = 0.2 
const MOVE_SPEED = 0.5 
const TARGET_OFFSET_FROM_CHEST = new Vector3(0, 0, 0.5)

export enum EnemyState {
  ALIVE,
  STUNNED,
  DESTROYED,
  HIBERNATING
}

interface EnemyProps {
  id?: string
  onRegister?: (id: string, ref: { isHibernated: () => boolean, spawn: (position: Vector3) => void }) => void
}

export interface EnemyRef {
  isHibernated: () => boolean
  spawn: (position: Vector3) => void
}

export const Enemy = forwardRef<EnemyRef, EnemyProps>(({ id, onRegister }, ref) => {  
  const modelUrl = 'alien-drone.glb'
  const { globalScale, debug } = useSceneStore()
  const sceneClone = SkeletonUtils.clone(useGLTF(modelUrl).scene)
  const group = useRef<Group>(null)
  const rbdRef = useRef<any>(null)
  const uiGroupRef = useRef<Group>(null)
  const stunStartTime = useRef(0)
  const destroyedStartTime = useRef(0)
  const { chestRef } = useAnimationStore()
  
  const [enemyState, setEnemyState] = useState<EnemyState>(EnemyState.HIBERNATING)
  const [currentHp, setCurrentHp] = useState(100)
  const [position, setPosition] = useState<Vector3>(new Vector3(0, 4, -5))

  useImperativeHandle(ref, () => ({
    isHibernated: () => enemyState === EnemyState.HIBERNATING,
    spawn: (newPosition: Vector3) => {
      setPosition(newPosition)
      setEnemyState(EnemyState.ALIVE)
      setCurrentHp(100)
    }
  }), [enemyState])

  useEffect(() => {
    if (onRegister && id) {
      onRegister(id, {
        isHibernated: () => enemyState === EnemyState.HIBERNATING,
        spawn: (newPosition: Vector3) => {
          setPosition(newPosition)
          setEnemyState(EnemyState.ALIVE)
          setCurrentHp(100)
        }
      })
    }
  }, [onRegister, id, enemyState])

  const handleContactForce = (event: any) => {
    if (!event.other.rigidBodyObject.userData?.isCharacterHand) return;

    const force = new Vector3(event.totalForce.x, event.totalForce.y, event.totalForce.z);
    const damage = Math.max(0, Math.floor(force.length() * FORCE_DAMAGE_MULTIPLIER / Math.pow(globalScale, 4)));
    
    setCurrentHp(Math.max(0, currentHp - damage))
    setEnemyState(EnemyState.STUNNED)
    stunStartTime.current = Date.now()
  }

  const destroyed = () => {
    setEnemyState(EnemyState.DESTROYED)
    destroyedStartTime.current = Date.now()
    rbdRef.current.setGravityScale(1)
  }

  useEffect(() => { 
    if (enemyState === EnemyState.STUNNED) {
      const stunRecoveryTimeout = setTimeout(() => {
        if (currentHp <= 0) {
          destroyed()
        } else {
          setEnemyState(EnemyState.ALIVE)
        }
      }, STUN_DURATION * 1000)
      return () => clearTimeout(stunRecoveryTimeout)
    } 
    else if (enemyState === EnemyState.DESTROYED) {
      const respawnTimeout = setTimeout(() => {
        setEnemyState(EnemyState.HIBERNATING)
      }, DESTROYED_DURATION * 1000)
      return () => clearTimeout(respawnTimeout)
    }
  }, [enemyState, currentHp])

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
    if (!chestRef.current || !rbdRef.current) return;

    const currentPosition = new Vector3().copy(rbdRef.current.translation())
    const characterDir = chestRef.current.localToWorld(TARGET_OFFSET_FROM_CHEST).sub(currentPosition).normalize()
    const newLinvel = characterDir.clone().multiplyScalar(MOVE_SPEED * globalScale)
    
    const currentQuat = new Quaternion().copy(rbdRef.current.rotation())
    const currentForward = new Vector3(0, 0, 1).applyQuaternion(currentQuat)
    
    const rotationAxis = currentForward.cross(characterDir).normalize()
    const rotationAngle = Math.acos(currentForward.dot(characterDir))
    const newAngvel = new Vector3().copy(rotationAxis).multiplyScalar(rotationAngle * ROTATE_SPEED)
    
    rbdRef.current.setLinvel(newLinvel, true)
    rbdRef.current.setAngvel(newAngvel, true)
  }

  useFrame((state) => {
    updateUI(state)
    updateSteering()
  })

  return (
    <group ref={group} dispose={null} key={id} visible={enemyState !== EnemyState.HIBERNATING}>
      <RigidBody
        ref={rbdRef}
        name="enemy"
        position={position}
        mass={100}
        colliders={false}
        friction={0.7}
        restitution={0.1}
        linearDamping={3}
        angularDamping={3}
        gravityScale={enemyState === EnemyState.ALIVE ? 0 : 0.1}
        onContactForce={handleContactForce}
        userData={{ isEnemy: true, enemyId: id }}
      >
        <BallCollider args={[0.4]} />
        {enemyState === EnemyState.STUNNED && (
          <DebrisTimeEmitter velocity={new Vector3().copy(rbdRef.current?.linvel())} />
        )}
        {enemyState === EnemyState.DESTROYED && (
          <DebrisBurstEmitter velocity={new Vector3().copy(rbdRef.current?.linvel())} />
        )}
        {enemyState !== EnemyState.DESTROYED && (
          <>
            <primitive object={sceneClone}/>
            <group ref={uiGroupRef}>
              <Root pixelSize={0.01} depthTest={false} depthWrite={false} >
                <Container width={80} height={80} backgroundOpacity={0} >
                <Container width={currentHp/100 * 40} height={4} backgroundColor={"red"} positionType={"absolute"} positionTop={0} positionLeft={20}/>
                <Container width={40} height={1} backgroundColor={"red"} positionType={"absolute"} positionTop={4} positionLeft={20}/>
                {debug && <Text fontSize={10} color="white">
                  HP: {currentHp}
                </Text>}
                </Container>
              </Root>
            </group>
          </>
        )}
      </RigidBody>
    </group>
  )
})

useGLTF.preload('alien-drone.glb')