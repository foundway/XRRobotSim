import { useEffect, useRef } from 'react'
import { Object3D, Vector3, Group } from 'three'
import { useFrame, useThree } from '@react-three/fiber'
import { useXR } from '@react-three/xr'
import { Root, Text, setPreferredColorScheme } from '@react-three/uikit'
import { Button, Card } from '@react-three/uikit-default'
import { Menu as MenuIcon, ChevronDown } from '@react-three/uikit-lucide'
import { EnvironmentMenu } from './EnvironmentMenu'
import { AnimationMenu } from './AnimationMenu'
import { GeometryMenu } from './GeometryMenu'
import { Separator } from './Separator'
import { useModelStore } from '@/store/ModelStore'

export const MainMenu = () => {
  const { scene, camera } = useThree()
  const { session } = useXR()
  const groupRef = useRef<Group>(null)
  const prevCameraToMenu = useRef(new Vector3())
  const prevTargetPos = useRef(new Vector3())
  const { setScale } = useModelStore()
  const { isMenuVisible, setMenuVisible } = useModelStore()
  const ANGLE_THRESHOLD = 30
  const LERP_SPEED = 4 
  const Y_OFFSET = -0.7
  const Z_OFFSET = 1

  useFrame((_, delta) => {
    updateMenuPosition(delta)
  })

  useEffect(() => {
    if (session) {
      setMenuVisible(false)
    }
  }, [session, setMenuVisible])

  const updateMenuPosition = (delta: number) => {
    if (!camera || !groupRef.current) return

    const cameraWorldPos = camera.getWorldPosition(new Vector3())
    const cameraToMenu = camera.getWorldDirection(new Vector3()).setY(Y_OFFSET).normalize()
    
    if (cameraToMenu.angleTo(prevCameraToMenu.current) * (180/Math.PI) < ANGLE_THRESHOLD) {
      cameraToMenu.copy(prevCameraToMenu.current)
    } else {
      prevCameraToMenu.current.copy(cameraToMenu)
    }
    const targetPos = camera.position.clone().add(cameraToMenu.multiplyScalar(Z_OFFSET))
    const smoothPos = prevTargetPos.current.lerp(targetPos, 1 - Math.exp(-LERP_SPEED * delta))
    groupRef.current.position.copy(smoothPos)
    groupRef.current.lookAt(cameraWorldPos)
  }

  const handleXRClick = () => {
    resetTransformation()
    session?.end()
  }

  const toggleMenu = () => {
    setMenuVisible(!isMenuVisible)
  }

  const resetTransformation = () => {
    setScale(1)
    scene.traverse((object) => {
      if (object instanceof Object3D && object.userData.isCharacter) {
        object.parent?.position.set(0, 0, 0)
        object.parent?.rotation.set(0, 0, 0)
      }
    })
  }

  setPreferredColorScheme("dark")

  if (!session) return null

  return (
    <group ref={groupRef} >
      <Root pixelSize={0.0015} 
        flexDirection={"column"} 
        alignItems={"center"} 
        depthTest={false} 
        depthWrite={false}
      >
        {isMenuVisible && (<Card 
          positionType="absolute"
          positionBottom={50}
          flexDirection="column" 
          alignItems="stretch"
          padding={4}
        >
          <GeometryMenu />
          <AnimationMenu />
          <EnvironmentMenu />
          <Separator />
          <Button onClick={handleXRClick} variant="ghost">
            <Text width={"100%"}>Exit XR</Text>
          </Button>
        </Card>)}
        <Button onClick={toggleMenu} variant="secondary" size="icon" borderRadius={100} >
          {isMenuVisible ? <ChevronDown /> : <MenuIcon />}
        </Button>
      </Root>
    </group>
  )
}
