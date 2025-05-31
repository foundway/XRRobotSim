import { useState, useRef, ReactNode } from 'react'
import { Container } from '@react-three/uikit'
import { Button, Card } from '@react-three/uikit-default'
import { ChevronRight } from '@react-three/uikit-lucide'
import { Text } from '@react-three/uikit'

interface SubMenuProps {
  title: string
  children: ReactNode
  cardWidth?: number
  cardPadding?: number
}

export const SubMenu = ({ title, children, cardWidth = 200, cardPadding = 4 }: SubMenuProps) => {
  const [showMenu, setShowMenu] = useState(false)
  const hoverTimer = useRef<NodeJS.Timeout | null>(null)
  const MENU_HOVER_DELAY = 300

  const handlePointerEnter = () => {
    hoverTimer.current = setTimeout(() => {
      setShowMenu(true)
    }, MENU_HOVER_DELAY)
  }

  const handlePointerLeave = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current)
    setShowMenu(false)
  }

  return (
    <Container 
      flexDirection="row" 
      alignItems="flex-end"
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
    >
      <Button variant="ghost">
        <Text width={"100%"}>{title}</Text>
        <ChevronRight />
      </Button>
      <Container width={0} height={0}>
        {showMenu && (
          <Card 
            positionType="absolute"
            positionLeft={-8} 
            positionBottom={-8} 
            padding={cardPadding}
            width={cardWidth}
          >
            {children}
          </Card>
        )}
      </Container>
    </Container>
  )
} 