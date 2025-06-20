import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { OrbitControls, Grid } from '@react-three/drei'
import { useXR, XROrigin } from '@react-three/xr'
import { RigidBody } from '@react-three/rapier'
import { Character } from '@/components/three/Character'
import { Environment } from '@/components/three/Environment'
import { Cockpit } from '@/components/three/Cockpit'
import { EnemySpawner } from '@/components/three/EnemySpawner'
import { MainMenu } from '@/components/ui/MainMenu'
import { useSceneStore } from '@/store/SceneStore'
import ExampleFX from './exampleParticles'

const Scene = () => {
  const { showGrid, orbitCenter, stageRadius } = useSceneStore()
  const { camera } = useThree()
  const { session } = useXR()

  useEffect(() => {
    camera.lookAt(0, 2, 3)
    camera.position.x = 0
    camera.position.z = 0
    camera.position.y = 1
    camera.updateProjectionMatrix()
  }, [camera])

  return (
    <>
      <color attach="background" args={['#333333']} />
      <Environment />
      <Character />
      <EnemySpawner />
      {!session && <OrbitControls target={[0, orbitCenter, -3]} />}
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
      <ExampleFX />
      <XROrigin position={[0, 0, 0]} >
        <MainMenu />
        <Cockpit />
      </XROrigin>
    </>
  )
}

export default Scene 