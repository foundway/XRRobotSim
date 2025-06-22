import { Group, Vector3, Quaternion, SkinnedMesh } from 'three'
import React, { useEffect, useRef } from 'react'
import { useGLTF } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { RigidBody } from '@react-three/rapier'
import { SkeletonUtils } from 'three-stdlib'
import { useAnimationStore } from '@/store/AnimationStore'

interface EnemyProps {
  initialPosition?: Vector3
  id?: string
}

export const Enemy = ({ initialPosition, id, ...props }: EnemyProps) => {  
  const modelUrl = 'alien-drone.glb'
  const { scene } = useGLTF(modelUrl)
  const clone = React.useMemo(() => SkeletonUtils.clone(scene), [scene])
  const group = React.useRef<Group>(null)
  const rigidBodyRef = useRef<any>(null)
  const ENEMY_ORIGIN = initialPosition || new Vector3(0, 4, -5) // Use provided position or default
  const { characterPosition } = useAnimationStore()
  const MOVE_SPEED = 0.5 // Speed at which enemy moves toward character
  const [isStunned, setIsStunned] = React.useState(false)
  const stunStartTime = useRef(0)
  const STUN_DURATION = 1 // Stun duration in seconds
  const CHARACTER_HEIGHT = new Vector3(0, 2, 0)

  useEffect(() => { // Find the skinned mesh in the model
    clone.traverse((child) => {
      if (child instanceof SkinnedMesh) {
        // Store reference to skinned mesh if needed for future IK or animations
      }
    })
  }, [clone])
  
  const handleCollision = (event: any) => {
    if (event.other.rigidBodyObject) {
        const userData = event.other.rigidBodyObject.userData
        if (userData?.isCharacterHand && !isStunned) {
            setIsStunned(true)
            stunStartTime.current = Date.now()
            
            // Stop current movement
            if (rigidBodyRef.current) {
                rigidBodyRef.current.setLinvel({ x: 0, y: 0, z: 0 }, true)
            }
        }
    }
  }

  // Check if stun duration has ended
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

  useFrame((state) => {
    if (!rigidBodyRef.current) {
      return
    }

    if (isStunned) return

    const enemyPosition = rigidBodyRef.current.translation()
    const enemyPos = new Vector3(enemyPosition.x, enemyPosition.y, enemyPosition.z)
    const direction = characterPosition.clone().add(CHARACTER_HEIGHT).sub(enemyPos).normalize()
    
    rigidBodyRef.current.setLinvel(direction.multiplyScalar(MOVE_SPEED), true)

    // Make enemy face the character with some smoothing
    if (direction.length() > 0.1) {
      const targetRotation = new Quaternion().setFromUnitVectors(
        new Vector3(0, 0, 1), // Forward direction
        direction
      )
      
      // Smooth rotation
      const currentRotation = rigidBodyRef.current.rotation()
      const currentQuat = new Quaternion(currentRotation.x, currentRotation.y, currentRotation.z, currentRotation.w)
      currentQuat.slerp(targetRotation, 0.5)
      rigidBodyRef.current.setRotation(currentQuat, true)
    }
  })
  
  return (
    <RigidBody 
      ref={rigidBodyRef}
      position={ENEMY_ORIGIN}
      colliders="ball"
      args={[0.5]}
      mass={1000}
      friction={0.7}
      restitution={0.1}
      linearDamping={0.8}
      angularDamping={0.8}
      gravityScale={0}
      onCollisionEnter={handleCollision}
      userData={{ isEnemy: true, enemyId: id }}
    >
      <group ref={group} dispose={null} key={id}>
        <group name="enemy" >
          <primitive object={clone} scale={1} userData={{ isEnemy: true, enemyId: id }} />
        </group>
      </group>
    </RigidBody>
  )
} 