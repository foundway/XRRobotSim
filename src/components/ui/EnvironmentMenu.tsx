import { Container, Text } from '@react-three/uikit'
import { Button, Slider } from '@react-three/uikit-default'
import { Check } from '@react-three/uikit-lucide'
import { useSceneStore, Environments } from '@/store/SceneStore'
import { Separator } from '@/components/ui/Separator'
import { SubMenu } from '@/components/ui/SubMenu'

const BrightnessSlider = () => {
  const { backgroundIntensity, setBackgroundIntensity } = useSceneStore()
  return (
    <Container flexDirection="column" marginTop={0} marginLeft={24} marginRight={12} marginBottom={8} >
      <Text paddingBottom={16} fontWeight="bold" fontSize={10}>Brightness</Text>
      <Container alignItems="center" gap={12} paddingRight={12}>
        <Text width={40} textAlign="left">{backgroundIntensity.toFixed(2)}</Text>
        <Slider
          min={0} max={2} step={0.01} width={120} value={backgroundIntensity}
          onValueChange={(value) => {
            setBackgroundIntensity(value)
          }}
        />
      </Container>
    </Container>
  )
}

export const EnvironmentMenu = () => {
  const { setEnvironment, currentEnvironment, showBackground, toggleBackground } = useSceneStore()

  return (
    <SubMenu title="Scene">
      <Button onClick={toggleBackground} variant="ghost" hover={{ backgroundOpacity: 0.1 }}>
        <Container width={16} />
        <Text width={"100%"}>{showBackground ? 'Hide Background' : 'Show Background'}</Text>
      </Button>
      <BrightnessSlider />
      <Separator />
      {Object.entries(Environments).map(([name, url]) => (
        <Button
          key={name}
          variant="ghost"
          hover={{ backgroundOpacity: 0.1 }}
          gap={4}
          alignItems="center"
          onClick={() => setEnvironment(url)}
        >
          {currentEnvironment === url ? <Check width={16} /> : <Container width={16} />}
          <Text width="100%">{name}</Text>
        </Button>
      ))}
    </SubMenu>
  )
} 