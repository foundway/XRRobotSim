import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { OrbitControls, Grid } from '@react-three/drei'
import { useXR, XROrigin } from '@react-three/xr'
import { Character } from '@/components/three/Character'
import { Environment } from '@/components/three/Environment'
import { MainMenu } from '@/components/ui/MainMenu'
import { useSceneStore } from '@/store/SceneStore'

const Scene = () => {
  const { showGrid, orbitCenter, stageRadius } = useSceneStore()
  const { camera } = useThree()
  const { session } = useXR()

  useEffect(() => {
    camera.position.z = stageRadius * 1.5
    camera.position.y = orbitCenter * 1.333
    camera.updateProjectionMatrix()
  }, [stageRadius, camera])

  return (
    <>
      <color attach="background" args={['#333333']} />
      <Environment />
      <Character />
      {!session && <OrbitControls target={[0, orbitCenter, 0]} />}
      {showGrid && (
        <Grid
          position={[0, 0, 0]}
          args={[20, 20]}
          cellSize={0.5}
          cellThickness={1}
          cellColor="#eee"
          sectionSize={100}
          sectionThickness={1}
          sectionColor="#944"
          fadeDistance={3}
          renderOrder={-1}
        />
      )}
      <XROrigin position={[0, 0, 0]} >
        <MainMenu />
      </XROrigin>
    </>
  )
}

export default Scene 