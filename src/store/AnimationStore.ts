import { create } from 'zustand'

interface AnimationState {
  currentAnimation: string
  setCurrentAnimation: (animationName: string) => void
  animations: any[]
  setAnimations: (animations: any[]) => void
  rotation: number
  setRotation: (rotation: number) => void
  addRotation: (delta: number) => void
}

export const useAnimationStore = create<AnimationState>((set) => ({
  currentAnimation: '',
  setCurrentAnimation: (animationName) => set({ currentAnimation: animationName }),
  animations: [],
  setAnimations: (animations) => set({ animations }),
  rotation: 0,
  setRotation: (rotation) => set({ rotation }),
  addRotation: (delta) => set((state) => ({ rotation: state.rotation + delta })),
})) 