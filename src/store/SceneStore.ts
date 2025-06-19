import { create } from 'zustand'
import * as THREE from 'three'
import { useRef, RefObject } from 'react'

const Environments = {
  "Minedump": 'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/2k/minedump_flats_2k.hdr',
  "Hanger": 'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/2k/small_hangar_01_2k.hdr',
  "Hall": 'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/2k/dancing_hall_2k.hdr',
  "Ballroom": 'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/2k/vestibule_2k.hdr',
  "Field": 'https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/2k/pretoria_gardens_2k.hdr',
}

interface SceneState {
  showBackground: boolean
  showGrid: boolean
  currentEnvironment: string
  orbitCenter: number
  stageRadius: number
  centeringOffset: THREE.Vector3
  cockpitRef: RefObject<THREE.Object3D | null>
  setCenteringOffset: (offset: THREE.Vector3) => void
  toggleBackground: () => void
  toggleGrid: () => void
  setEnvironment: (environment: string) => void
  setOrbitCenter: (center: number) => void
  setStageRadius: (radius: number) => void
}

export const useSceneStore = create<SceneState>((set) => ({
  showBackground: true,
  showGrid: false,
  currentEnvironment: Environments["Minedump"],
  orbitCenter: 2,
  stageRadius: 3,
  centeringOffset: new THREE.Vector3(0, 0, 0),
  cockpitRef: { current: null },
  setCenteringOffset: (offset) => set({ centeringOffset: offset }),
  toggleBackground: () => set((state) => ({ showBackground: !state.showBackground })),
  toggleGrid: () => set((state) => ({ showGrid: !state.showGrid })),
  setEnvironment: (environment: string) => set({ currentEnvironment: environment }),
  setOrbitCenter: (center) => set({ orbitCenter: center }),
  setStageRadius: (radius) => set({ stageRadius: radius }),
}))

export { Environments } 