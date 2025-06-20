import { Suspense } from 'react'
import { Environment as DreiEnvironment } from '@react-three/drei'
import { useSceneStore } from '@/store/SceneStore'

const EnvironmentContent = () => {
  const { currentEnvironment, showBackground } = useSceneStore()
  
  return (
    <DreiEnvironment
      files={currentEnvironment}
      {...(showBackground ? {
        background: true,
        ground: { height: 10, radius: 200, scale: 100 }
      } : { background: false })}
    />
  )
}

export const Environment = () => {
  return (
    <Suspense fallback={null}>
      <EnvironmentContent />
    </Suspense>
  )
} 