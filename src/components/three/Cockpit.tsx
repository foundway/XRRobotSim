import { Vector3 } from 'three'
import { useFrame } from '@react-three/fiber'
import { Root, Text, Container, setPreferredColorScheme } from '@react-three/uikit'
import { Button, Card } from '@react-three/uikit-default'
import { useSceneStore } from '@/store/SceneStore'
import { useAnimationStore } from '@/store/AnimationStore'

const CHEST_TO_CAMERA_OFFSET = 0.3

const getHorizontalDirectionToCharacter = (cameraPosition: Vector3, characterPosition: Vector3): Vector3 => {
  const direction = new Vector3()
  direction.subVectors(characterPosition, cameraPosition)
  direction.y = 0 
  direction.normalize()
  return direction
}

export const Cockpit = () => {
  const { cockpitRef } = useSceneStore()
  const { chestRef } = useAnimationStore()

  useFrame((state) => {
    if (cockpitRef.current) {
      cockpitRef.current.position.copy(state.camera.position)
      cockpitRef.current.position.y = state.camera.position.y - CHEST_TO_CAMERA_OFFSET
      
      const direction = getHorizontalDirectionToCharacter(state.camera.position, chestRef.current?.getWorldPosition(new Vector3()) || new Vector3(0, 0, -100))
      const angleY = Math.atan2(direction.x, direction.z) // Calculate Y rotation to face the character
      cockpitRef.current.rotation.set(0, angleY, 0) // Set rotation only around Y axis
    }
  })

  return (
    <>
      <group ref={cockpitRef}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[1, 0, 1]} />
          <meshBasicMaterial color="blue" wireframe={true} />
        </mesh>
        <group position={[0, 0.5, -1]}>
          <Root>
            <Container>
              <Text fontSize={10}>
                Hello
              </Text>
            </Container>
          </Root>
        </group>
      </group>
    </>
  )
} 