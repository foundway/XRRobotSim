import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Grid } from '@react-three/drei'
import { useXR, XROrigin } from '@react-three/xr'
import { Character } from '@/components/three/Character'
import { Environment } from '@/components/three/Environment'
import { Cockpit } from '@/components/three/Cockpit'
import { EnemySpawner } from '@/components/three/EnemySpawner'
import { MainMenu } from '@/components/ui/MainMenu'
import { useSceneStore } from '@/store/SceneStore'
import { DebrisParticles, SparksParticles } from './Particles'

export const GLOBAL_SCALE = 10
export const MAX_PHYSICS_SPEED = 10 * GLOBAL_SCALE

const Scene = ({globalScale}: {globalScale: number}) => {
  const { showGrid, orbitCenter, playerScaleRef, xrOriginRef } = useSceneStore()
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
      <group name="global-scale" scale={globalScale}>
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
      </group>
      <group ref={playerScaleRef} name="player-scale">
        <Environment />
        <SparksParticles />
        <DebrisParticles />
        <XROrigin ref={xrOriginRef} position={[0, 0, 0]} >
          <MainMenu />
          <Cockpit />
        </XROrigin>
        <axesHelper/>
      </group>
    </>
  )
}

export default Scene 