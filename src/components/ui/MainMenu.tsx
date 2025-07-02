import { useEffect, useRef } from 'react'
import { useXR } from '@react-three/xr'
import { Container, Root, Text, setPreferredColorScheme } from '@react-three/uikit'
import { Button, Card } from '@react-three/uikit-default'
import { Menu as MenuIcon, ChevronDown } from '@react-three/uikit-lucide'
import { EnvironmentMenu } from './EnvironmentMenu'
import { AnimationMenu } from './AnimationMenu'
import { GeometryMenu } from './GeometryMenu'
import { Separator } from './Separator'
import { useModelStore } from '@/store/ModelStore'
import { GameMode, useSceneStore } from '@/store/SceneStore'

export const MainMenu = () => {
  const { session } = useXR()
  const { isMenuVisible, setMenuVisible } = useModelStore()
  const { setGameMode, setGlobalScale } = useSceneStore()

  useEffect(() => {
    if (session) {
      setMenuVisible(false)
    }
  }, [session, setMenuVisible])

  const handleXRClick = () => {
    setGameMode(GameMode.None)
    setGlobalScale(1)
    session?.end()
  }

  const toggleMenu = () => {
    setMenuVisible(!isMenuVisible)
  }

  setPreferredColorScheme("dark")

  if (!session) return null

  return (
      <Container 
        positionBottom={24}
        positionType={"absolute"}
        positionLeft={"50%"}
        positionRight={"50%"}
        flexDirection={"column"} 
        alignItems={"center"} 
      >
        {isMenuVisible && (<Card positionType="absolute" positionBottom={50} flexDirection="column" alignItems="stretch" backgroundOpacity={0.4} borderColor="white" borderWidth={2} padding={4} >
          <GeometryMenu />
          <AnimationMenu />
          <EnvironmentMenu />
          <Separator />
          <Button onClick={handleXRClick} variant="ghost" hover={{ backgroundOpacity: 0.5 }}>
            <Text width={"100%"}>Exit XR</Text>
          </Button>
        </Card>)}
        <Button onClick={toggleMenu} variant="secondary" size="icon" borderColor="white" borderRadius={100} borderWidth={2} backgroundOpacity={0.4} hover={{ backgroundOpacity: 0.5 }}>
          {isMenuVisible ? <ChevronDown /> : <MenuIcon />}
        </Button>
      </Container>
  )
}
