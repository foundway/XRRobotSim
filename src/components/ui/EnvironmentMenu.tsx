import { Container, Text } from '@react-three/uikit'
import { Button } from '@react-three/uikit-default'
import { Check } from '@react-three/uikit-lucide'
import { useSceneStore, Environments } from '@/store/SceneStore'
import { Separator } from '@/components/ui/Separator'
import { SubMenu } from '@/components/ui/SubMenu'

export const EnvironmentMenu = () => {
  const { setEnvironment, currentEnvironment, showBackground, toggleBackground, showGrid, toggleGrid } = useSceneStore()

  return (
    <SubMenu title="Environments">
      <Button onClick={toggleBackground} variant="ghost" >
        <Container width={16} />
        <Text width={"100%"}>{showBackground ? 'Hide Background' : 'Show Background'}</Text>
      </Button>
      <Separator />
      {Object.entries(Environments).map(([name, url]) => (
        <Button
          key={name}
          variant="ghost"
          gap={4}
          alignItems="center"
          onClick={() => setEnvironment(url)}
        >
          {currentEnvironment === url ? <Check width={16} /> : <Container width={16} />}
          <Text width="100%">{name}</Text>
        </Button>
      ))}
      <Separator />
      <Button onClick={toggleGrid} variant="ghost" gap={8}>
        <Container width={16} />
        <Text width={"100%"}>{showGrid ? 'Hide Grid' : 'Show Grid'}</Text>
      </Button>
    </SubMenu>
  )
} 