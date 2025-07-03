import { useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { OrbitControls, Grid } from '@react-three/drei'
import { useXR, XROrigin } from '@react-three/xr'
import { Character } from '@/components/three/Character'
import { Environment } from '@/components/three/Environment'
import { Cockpit } from '@/components/three/Cockpit'
import { EnemySpawner } from '@/components/three/EnemySpawner'
import { MainMenu } from '@/components/ui/MainMenu'
import { GameMode, useSceneStore } from '@/store/SceneStore'
import { DebrisParticles, SparksParticles } from './Particles'

export const MAX_PHYSICS_SPEED = 10

const Scene = ({globalScale}: {globalScale: number}) => {
  const { showGrid, playerScaleRef, xrOriginRef, gameMode } = useSceneStore()
  const { session } = useXR()

  return (
    <>
      <color attach="background" args={['#333333']} />
      <group name="global-scale" scale={globalScale}>
        <Character />
        {gameMode !== GameMode.None && <EnemySpawner />}
        {!session && <OrbitControls 
          target={[0, 1, -3]} 
          minPolarAngle={1.8} 
          maxPolarAngle={1.8}
          enableZoom={false}
          enablePan={false}
          autoRotate={true}
          rotateSpeed={2}
          autoRotateSpeed={1}
        />}
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
        <axesHelper/>
        {gameMode !== GameMode.None && (
          <XROrigin ref={xrOriginRef} position={[0, 0, 0]} >
            <Cockpit />
          </XROrigin>
        )}
      </group>
    </>
  )
}

export default Scene 