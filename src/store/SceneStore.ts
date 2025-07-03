import { create } from 'zustand'
import * as THREE from 'three'
import { useRef, RefObject } from 'react'

export enum GameMode {
  None = 'none',
  TwoMeter = '2-meter',
  TwentyMeter = '20-meter',
  TwentyMeterMounted = '20-meter-mounted'
}

const Environments = {
  "Minedump": 'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/2k/minedump_flats_2k.hdr',
  "Hanger": 'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/2k/small_hangar_01_2k.hdr',
  "Hall": 'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/2k/dancing_hall_2k.hdr',
  "Ballroom": 'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/2k/vestibule_2k.hdr',
  "Field": 'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/2k/pretoria_gardens_2k.hdr',
}

interface SceneState {
  centeringOffset: THREE.Vector3
  setCenteringOffset: (offset: THREE.Vector3) => void
  
  showBackground: boolean
  toggleBackground: () => void
  
  currentEnvironment: string
  setEnvironment: (environment: string) => void
  
  orbitCenter: number
  setOrbitCenter: (center: number) => void
  
  stageRadius: number
  setStageRadius: (radius: number) => void
  
  showGrid: boolean
  toggleGrid: () => void
  
  globalScale: number
  setGlobalScale: (scale: number) => void

  paused: boolean
  setPaused: (paused: boolean) => void

  gameMode: GameMode
  setGameMode: (gameMode: GameMode) => void

  cockpitRef: RefObject<THREE.Object3D | null>
  playerScaleRef: RefObject<THREE.Object3D | null>
  xrOriginRef: RefObject<THREE.Group | null>
  rightControllerRef: RefObject<THREE.Object3D | null>
  leftControllerRef: RefObject<THREE.Object3D | null>

  debug: boolean
  setDebug: (debug: boolean) => void
}

export const useSceneStore = create<SceneState>((set) => ({
  showBackground: true,
  toggleBackground: () => set((state) => ({ showBackground: !state.showBackground })),

  currentEnvironment: Environments["Minedump"],
  setEnvironment: (environment: string) => set({ currentEnvironment: environment }),

  centeringOffset: new THREE.Vector3(0, 0, 0),
  setCenteringOffset: (offset) => set({ centeringOffset: offset }),
  
  orbitCenter: 2,
  setOrbitCenter: (center) => set({ orbitCenter: center }),
  
  stageRadius: 3,
  setStageRadius: (radius) => set({ stageRadius: radius }),
  
  showGrid: false,
  toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),
  
  globalScale: 1,
  setGlobalScale: (scale) => set({ globalScale: scale }),

  paused: false,
  setPaused: (paused) => set({ paused }),

  gameMode: GameMode.None,
  setGameMode: (gameMode) => set({ gameMode }),

  cockpitRef: { current: null },
  playerScaleRef: { current: null },
  xrOriginRef: { current: null },
  rightControllerRef: { current: null },
  leftControllerRef: { current: null },

  debug: false,
  setDebug: (debug) => set({ debug }),
}))

export { Environments } 