import * as THREE from 'three'
import { Container, Text, } from '@react-three/uikit'
import { Button, Slider } from '@react-three/uikit-default'
import { useModelStore } from "../../store/ModelStore"
import { useThree } from '@react-three/fiber'
import { SubMenu } from './SubMenu'
import { Separator } from './Separator'

const InputSlider = () => {
  const { scale, setScale } = useModelStore()
  return (
    <Container flexDirection="column" marginTop={0} marginLeft={12} marginRight={12} marginBottom={8}>
      <Text paddingBottom={16} fontWeight="bold" fontSize={10}>Scale</Text>
      <Container alignItems="center" gap={12} paddingRight={12}>
        <Text width={40} textAlign="left">{scale.toFixed(2)}</Text>
        <Slider
          min={0.1} max={3} step={0.01} width={120} value={scale}
          onValueChange={(value) => {
            setScale(value)
          }}
        />
      </Container>
    </Container>
  )
}

export const GeometryMenu = () => {
  const { scene } = useThree()
  const { setScale } = useModelStore()

  const resetTransformation = () => {
    setScale(1)
    scene.traverse((object) => {
      if (object instanceof THREE.Object3D && object.userData.isCharacter) {
        object.parent?.position.set(0, 0, 0)
        object.parent?.rotation.set(0, 0, 0)
      }
    })
  }

  return (
    <SubMenu title="Geometry" cardPadding={12}>
      <Button variant="ghost">
        <Text width="100%">Enable Steering</Text>
      </Button>
      <Separator />
      <InputSlider />
      <Separator />
      <Button variant="ghost" onClick={resetTransformation}>
        <Text width={"100%"}>Reset Transformation</Text>
      </Button>
    </SubMenu>
  )
} 