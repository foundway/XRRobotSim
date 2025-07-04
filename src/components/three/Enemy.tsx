import { Group, Vector3, Quaternion } from 'three'
import { useEffect, useRef, useState} from 'react'
import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { RigidBody, BallCollider } from '@react-three/rapier'
import { Root, Text } from '@react-three/uikit'
import { SkeletonUtils } from 'three-stdlib'
import { useAnimationStore } from '@/store/AnimationStore'
import { useSceneStore } from '@/store/SceneStore'
import { DebrisBurstEmitter, DebrisTimeEmitter } from './DebrisEmitter'
import { MAX_PHYSICS_SPEED } from './Scene'

const STUN_DURATION = 1 
const DESTROYED_DURATION = 1 
const FORCE_DAMAGE_MULTIPLIER = 0.5
const ROTATE_SPEED = 0.2 
const MOVE_SPEED = 0.5 

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
  const { enemyCount, setEnemyCount, globalScale } = useSceneStore()
  const sceneClone = SkeletonUtils.clone(useGLTF(modelUrl).scene)
  const group = useRef<Group>(null)
  const rbdRef = useRef<any>(null)
  const uiGroupRef = useRef<Group>(null)
  const stunStartTime = useRef(0)
  const destroyedStartTime = useRef(0)
  const { chestRef } = useAnimationStore()
  const hp = useRef(100 * globalScale)
  const [enemyState, setEnemyState] = useState(EnemyState.ALIVE)

  const ENEMY_ORIGIN = initialPosition || new Vector3(0, 4, -5) // Use provided position or default

  const handleContactForce = (event: any) => {
    if (!event.other.rigidBodyObject.userData?.isCharacterHand) return;

    const force = new Vector3(event.totalForce.x, event.totalForce.y, event.totalForce.z);
    const damage = Math.max(0, Math.floor(force.length() * FORCE_DAMAGE_MULTIPLIER / (globalScale * globalScale)));
    hp.current -= damage;

    setEnemyState(EnemyState.STUNNED);

    const vel = new Vector3().copy(event.target.rigidBody.linvel())
    if (vel.length() > MAX_PHYSICS_SPEED * globalScale) {
      event.target.rigidBody.setLinvel(vel.normalize().multiplyScalar(MAX_PHYSICS_SPEED * globalScale), true)
    }
    stunStartTime.current = Date.now()
  }

  const destroyed = () => {
    setEnemyState(EnemyState.DESTROYED)
    destroyedStartTime.current = Date.now()
    rbdRef.current.setGravityScale(1)
  }

  useEffect(() => {
    if (enemyState === EnemyState.STUNNED) {
      const checkStunEnd = () => {
        if (Date.now() - stunStartTime.current >= STUN_DURATION * 1000) {
          if (hp.current <= 0) {
            destroyed()
          } else {
            setEnemyState(EnemyState.ALIVE)
          }
        }
      }
      const interval = setInterval(checkStunEnd, 100)
      return () => clearInterval(interval)
    } else if (enemyState === EnemyState.DESTROYED) {
      const checkDestroyedEnd = () => {
        if (Date.now() - destroyedStartTime.current >= DESTROYED_DURATION * 1000) {
          console.log('Removed enemy id: ', id)
          setEnemyCount(enemyCount - 1)
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
    if (!chestRef.current) return;
    if (!rbdRef.current) return;

    const position = new Vector3().copy(rbdRef.current.translation())
    const characterDir = chestRef.current.getWorldPosition(new Vector3()).sub(position).normalize()
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

  if (enemyState === EnemyState.REMOVED) {
    return null
  }

  return (
    <group ref={group} dispose={null} key={id}>
      <RigidBody
        ref={rbdRef}
        name="enemy"
        position={ENEMY_ORIGIN}
        mass={100}
        colliders={false}
        friction={0.7}
        restitution={0.1}
        linearDamping={2}
        angularDamping={2}
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
                <Text fontSize={10} color="white">
                  HP: {hp.current}
                </Text>
              </Root>
            </group>
          </>
        )}
      </RigidBody>
    </group>
  )
} 

useGLTF.preload('alien-drone.glb')