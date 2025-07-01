import { RenderMode, VFXEmitter } from 'wawa-vfx'
import { Vector3 } from 'three';
import { useSceneStore } from '@/store/SceneStore';

const DIR_SPREAD = 10
const POS_SPREAD = 0.25

const createParticleSettings = (globalScale: number) => ({
  intensity: 2,
  particlesLifetime: [0.5, 1] as [number, number],
  gravity: [0, -9.8, 0] as [number, number, number], 
  fadeSize: [0.15, 0] as [number, number],
  fadeAlpha: [0.15, 0] as [number, number],
  renderMode: RenderMode.Billboard,
  frustumCulled: false,
  startPositionMin: [-POS_SPREAD * globalScale, -POS_SPREAD * globalScale, -POS_SPREAD * globalScale] as [number, number, number],
  startPositionMax: [POS_SPREAD * globalScale, POS_SPREAD * globalScale, POS_SPREAD * globalScale] as [number, number, number],
  directionMin: [-DIR_SPREAD, -DIR_SPREAD, -DIR_SPREAD] as [number, number, number],
  directionMax: [DIR_SPREAD, DIR_SPREAD, DIR_SPREAD] as [number, number, number],
  rotationSpeedMin: [-3.14, -3.14, -31.4] as [number, number, number],
  rotationSpeedMax: [3.14, 3.14, 31.4] as [number, number, number],
  startRotationMin: [0, 0, -6.28] as [number, number, number],
  startRotationMax: [0, 0, 6.28] as [number, number, number],
  colorStart: ["#77ff77"],
  colorEnd: ["#ff1111"]
}); 

export const DebrisTimeEmitter = ({ velocity }: { velocity: Vector3 }) => {
  const { globalScale } = useSceneStore()
  const dir = velocity ? 
    [velocity.x, velocity.y, velocity.z] as [number, number, number] : 
    [0, 0, 0] as [number, number, number];
  const dirMin: [number, number, number] = [dir[0] - DIR_SPREAD, dir[1] - DIR_SPREAD, dir[2] - DIR_SPREAD];
  const dirMax: [number, number, number] = [dir[0] + DIR_SPREAD, dir[1] + DIR_SPREAD, dir[2] + DIR_SPREAD];
  return (
    <VFXEmitter
      emitter="debris"
      settings={{
        ...createParticleSettings(globalScale),
        spawnMode: "time",
        loop: true,
        size: [0.15 * globalScale, 0.5 * globalScale],
        duration: 1,
        nbParticles: 30 * globalScale,
        speed: [0.1, 2],
        directionMin: dirMin,
        directionMax: dirMax,
      }}
    />
  )
} 

export const DebrisBurstEmitter = ({ velocity }: { velocity: Vector3 }) => {
  const { globalScale } = useSceneStore()
  const dir = velocity ? 
    [velocity.x, velocity.y, velocity.z] as [number, number, number] : 
    [0, 0, 0] as [number, number, number];
  const dirMin: [number, number, number] = [dir[0] - DIR_SPREAD, dir[1] - DIR_SPREAD, dir[2] - DIR_SPREAD];
  const dirMax: [number, number, number] = [dir[0] + DIR_SPREAD, dir[1] + DIR_SPREAD, dir[2] + DIR_SPREAD];
  return (
    <VFXEmitter
      emitter="debris"
      settings={{
        ...createParticleSettings(globalScale),
        spawnMode: "burst",
        loop: false,
        size: [0.2 * globalScale, 0.7 * globalScale],
        duration: 1,
        nbParticles: 100 * globalScale,
        speed: [0.1, 4],
        directionMin: dirMin,
        directionMax: dirMax,
      }}
    />
  )
} 