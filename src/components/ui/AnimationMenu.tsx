import { Container, Text } from '@react-three/uikit'
import { Button } from '@react-three/uikit-default'
import { Check } from '@react-three/uikit-lucide'
import { useAnimationStore } from '@/store/AnimationStore'
import { SubMenu } from '@/components/ui/SubMenu'

export const AnimationMenu = () => {
  const { animations, setCurrentAnimation, currentAnimation } = useAnimationStore()

  return (
    <SubMenu title="Animations">
      {animations && animations.length > 0 ? (
        animations.map((clip) => (
          <Button
            key={clip.name}
            variant="ghost"
            gap={4}
            alignItems="center"
            onClick={() => setCurrentAnimation(clip.name)}
          >
            {currentAnimation === clip.name ? <Check width={16} /> : <Container width={16} />}
            <Text width="100%">{clip.name}</Text>
          </Button>
        ))
      ) : (
        <Text width="100%" padding={8}>No Animation</Text>
      )}
    </SubMenu>
  )
} 