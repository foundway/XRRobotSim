import { create } from 'zustand'

interface AnimationState {
  currentAnimation: string
  setCurrentAnimation: (animationName: string) => void
  animations: any[]
  setAnimations: (animations: any[]) => void
}

export const useAnimationStore = create<AnimationState>((set) => ({
  currentAnimation: '',
  setCurrentAnimation: (animationName) => set({ currentAnimation: animationName }),
  animations: [],
  setAnimations: (animations) => set({ animations }),
})) 