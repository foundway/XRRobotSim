import { create } from 'zustand'

interface ModelStore {
  scale: number
  setScale: (scale: number) => void
  isMenuVisible: boolean
  setMenuVisible: (visible: boolean) => void
}

export const useModelStore = create<ModelStore>((set) => ({
  scale: 1,
  setScale: (scale) => set({ scale }),
  isMenuVisible: false,
  setMenuVisible: (visible) => set({ isMenuVisible: visible }),
})) 