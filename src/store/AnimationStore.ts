import { create } from 'zustand'

interface AnimationState {
  currentAnimation: string
  setCurrentAnimation: (animationName: string) => void
  animations: any[]
  setAnimations: (animations: any[]) => void
  orientation: number
  setOrientation: (rotation: number) => void
  addOrientation: (delta: number) => void
}

export const useAnimationStore = create<AnimationState>((set) => ({
  currentAnimation: '',
  setCurrentAnimation: (animationName) => set({ currentAnimation: animationName }),
  animations: [],
  setAnimations: (animations) => set({ animations }),
  orientation: 0,
  setOrientation: (rotation) => set({ orientation: rotation }),
  addOrientation: (delta) => set((state) => ({ orientation: state.orientation + delta })),
})) 