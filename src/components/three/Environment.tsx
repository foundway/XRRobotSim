import { Suspense } from 'react'
import { Environment as DreiEnvironment } from '@react-three/drei'
import { useSceneStore } from '@/store/SceneStore'


const EnvironmentContent = () => {
  const { currentEnvironment, showBackground, backgroundIntensity } = useSceneStore()
  
  return (
    <DreiEnvironment
      files={currentEnvironment}
      environmentIntensity={backgroundIntensity}
      {...(showBackground ? {
        background: true,
        ground: { height: 30, radius: 1000, scale: 100 },
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