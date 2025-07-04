import { RenderMode, VFXEmitter } from 'wawa-vfx'
import { Vector3 } from 'three';
import { useSceneStore } from '@/store/SceneStore';

const DIR_SPREAD = 2
const POS_SPREAD = 0.25

const createParticleSettings = (globalScale: number, dir: Vector3) => ({
  intensity: 2,
  particlesLifetime: [0.5, 1] as [number, number],
  gravity: [0, -9.8, 0] as [number, number, number], 
  fadeSize: [0.15, 0] as [number, number],
  fadeAlpha: [0.15, 0] as [number, number],
  renderMode: RenderMode.Billboard,
  frustumCulled: false,
  startPositionMin: [-POS_SPREAD * globalScale, -POS_SPREAD * globalScale, -POS_SPREAD * globalScale] as [number, number, number],
  startPositionMax: [POS_SPREAD * globalScale, POS_SPREAD * globalScale, POS_SPREAD * globalScale] as [number, number, number],
  rotationSpeedMin: [-3.14, -3.14, -31.4] as [number, number, number],
  rotationSpeedMax: [3.14, 3.14, 31.4] as [number, number, number],
  startRotationMin: [0, 0, -6.28] as [number, number, number],
  startRotationMax: [0, 0, 6.28] as [number, number, number],
  directionMin: [dir.x - DIR_SPREAD, dir.y - DIR_SPREAD, dir.z - DIR_SPREAD] as [number, number, number],
  directionMax: [dir.x + DIR_SPREAD, dir.y + DIR_SPREAD, dir.z + DIR_SPREAD] as [number, number, number],
  colorStart: ["#77ff77", "#bbee77"],
  colorEnd: ["#cc0000", "#cc0000"]
}); 

export const DebrisTimeEmitter = ({ velocity }: { velocity: Vector3 }) => {
  const { globalScale } = useSceneStore()
  return (
    <VFXEmitter
      emitter="debris"
      settings={{
        ...createParticleSettings(globalScale, velocity.normalize()),
        spawnMode: "time",
        loop: true,
        size: [0.15 * globalScale, 0.5 * globalScale],
        duration: 1,
        nbParticles: 30 * globalScale,
        speed: [0.1 * globalScale, 1 * globalScale],
      }}
    />
  )
} 

export const DebrisBurstEmitter = ({ velocity }: { velocity: Vector3 }) => {
  const { globalScale } = useSceneStore()
  return (
    <VFXEmitter
      emitter="debris"
      settings={{
        ...createParticleSettings(globalScale, velocity.normalize()),
        spawnMode: "burst",
        loop: false,
        size: [0.2 * globalScale, 0.7 * globalScale],
        duration: 1,
        nbParticles: 100 * globalScale,
        speed: [0.1 * globalScale, 3 * globalScale],
      }}
    />
  )
} 