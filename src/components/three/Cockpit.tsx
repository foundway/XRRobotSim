import { useRef, useState } from 'react'
import { Vector3 } from 'three'
import { useFrame } from '@react-three/fiber'
import { Root, Container, Text } from '@react-three/uikit'
import { useSceneStore, GameMode, LocomotionCommand } from '@/store/SceneStore'
import { useAnimationStore } from '@/store/AnimationStore'
import { MainMenu } from '../ui/MainMenu'
import { Joystick } from '@react-three/uikit-lucide'
import { commandRef } from './Character'

const CHEST_TO_CAMERA_OFFSET = 0.3
const HUD_DISTANCE = 1
const HUD_AIM_TARGET_OFFSET = new Vector3(0, 0, 0.5)

const BOTTOM_BORDER_PROPS = {
  width: "100%" as const,
  height: 256,
  positionType: "absolute" as const,
  positionLeft: 0,
  positionRight: 0,
  backgroundOpacity: 0,
  borderColor: "white" as const,
  borderLeftWidth: 2,
  borderRightWidth: 2,
  positionBottom: 0,
  borderTopRadius: 0,
  borderBottomRadius: 8,
  borderTopWidth: 0,
  borderBottomWidth: 2,
}

const getHorizontalDirectionToCharacter = (cameraPosition: Vector3, characterPosition: Vector3): Vector3 => {
  const direction = new Vector3()
  direction.subVectors(characterPosition, cameraPosition)
  direction.y = 0 
  direction.normalize()
  return direction
}

export const Cockpit = () => {
  const { cockpitRef, debug, gameMode } = useSceneStore()
  const { chestRef } = useAnimationStore()
  const lastCommand = useRef<LocomotionCommand>(LocomotionCommand.Idle)
  const [displayCommand, setDisplayCommand] = useState<LocomotionCommand>(LocomotionCommand.Idle)

  useFrame((state) => {
    if (!cockpitRef.current || !chestRef.current) return
    
    cockpitRef.current.position.copy(state.camera.position)
    cockpitRef.current.position.y = state.camera.position.y - CHEST_TO_CAMERA_OFFSET
    
    const targetPosition = chestRef.current.localToWorld(HUD_AIM_TARGET_OFFSET.clone())
    const direction = getHorizontalDirectionToCharacter(state.camera.position, targetPosition)
    const angleY = Math.atan2(direction.x, direction.z) 
    if (gameMode != GameMode.TwentyMeterMounted) {
      cockpitRef.current.rotation.set(0, angleY, 0)
    } else {
      cockpitRef.current.rotation.set(0, Math.PI, 0) 
    }

    const currentCommand = commandRef.current
    if (currentCommand !== lastCommand.current) {
      lastCommand.current = currentCommand
      setDisplayCommand(currentCommand)
    }
  })

  return (
    <>
      <group ref={cockpitRef}>
        {debug && <mesh position={[0, 0, 0]}>
          <boxGeometry args={[1, 0, 1]} />
          <meshBasicMaterial color="blue" wireframe={true} />
        </mesh>}
        <group position={[0, CHEST_TO_CAMERA_OFFSET, HUD_DISTANCE]} rotation={[0, Math.PI, 0]}>
          <Root pixelSize={0.001} depthTest={false} depthWrite={false} >
            <Container width={1024} height={768} backgroundOpacity={0} >
              <MainMenu />
              <Container {...BOTTOM_BORDER_PROPS} />
              <Container positionType="absolute" positionRight={32} positionBottom={32} flexDirection="row" alignItems="center" gap={8}>
                <Text fontSize={24} color="white">
                  {displayCommand}
                </Text>
                <Joystick color="white" />
              </Container>
            </Container>
          </Root>
        </group>
      </group>
    </>
  )
} 