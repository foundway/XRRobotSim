import { Vector3 } from 'three'
import { useFrame } from '@react-three/fiber'
import { Root, Text, Container, setPreferredColorScheme } from '@react-three/uikit'
import { Button, Card } from '@react-three/uikit-default'
import { useSceneStore } from '@/store/SceneStore'
import { useAnimationStore } from '@/store/AnimationStore'
import { MainMenu } from '../ui/MainMenu'
import { DEBUG } from '@/App'

const CHEST_TO_CAMERA_OFFSET = 0.3
const HUD_DISTANCE = 1

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
        {DEBUG && <mesh position={[0, 0, 0]}>
          <boxGeometry args={[1, 0, 1]} />
          <meshBasicMaterial color="blue" wireframe={true} />
        </mesh>}
        <group position={[0, CHEST_TO_CAMERA_OFFSET, HUD_DISTANCE]} rotation={[0, Math.PI, 0]}>
          <Root pixelSize={0.001} depthTest={false} depthWrite={false} >
            <Container width={1024} height={768} backgroundOpacity={0} >
              <Container height={100} width={"100%"} positionType="absolute" positionTop={0} positionLeft={0} positionRight={0} backgroundOpacity={0} borderTopRadius={8} borderBottomRadius={0} borderColor="white" borderTopWidth={2} borderLeftWidth={2} borderRightWidth={2} borderBottomWidth={0} ></Container>
              <MainMenu />
              <Container height={100} width={"100%"} positionType="absolute" positionBottom={0} positionLeft={0} positionRight={0} backgroundOpacity={0} borderTopRadius={0} borderBottomRadius={8} borderColor="white" borderTopWidth={0} borderLeftWidth={2} borderRightWidth={2} borderBottomWidth={2} ></Container>
            </Container>
          </Root>
        </group>
      </group>
    </>
  )
} 