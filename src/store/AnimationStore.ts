import { create } from 'zustand'
import { Vector3, Quaternion } from 'three'

interface AnimationState {
  currentAnimation: string
  setCurrentAnimation: (animationName: string) => void
  animations: any[]
  setAnimations: (animations: any[]) => void
  orientation: number
  setOrientation: (rotation: number) => void
  addOrientation: (delta: number) => void
  characterPosition: Vector3
  setCharacterPosition: (position: Vector3) => void
  characterOrientation: number
  setCharacterOrientation: (orientationRadian: number) => void
}

export const useAnimationStore = create<AnimationState>((set) => ({
  currentAnimation: '',
  setCurrentAnimation: (animationName) => set({ currentAnimation: animationName }),
  animations: [],
  setAnimations: (animations) => set({ animations }),
  orientation: 0,
  setOrientation: (rotation) => set({ orientation: rotation }),
  addOrientation: (delta) => set((state) => ({ orientation: state.orientation + delta })),
  characterPosition: new Vector3(0, 0, -3),
  setCharacterPosition: (position) => set({ characterPosition: position }),
  characterOrientation: Math.PI,
  setCharacterOrientation: (orientationRadian) => set({ characterOrientation: orientationRadian})
})) 