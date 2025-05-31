//
// Setting models need to be in a separate context from Zustand to avoid re-rendering errors
//

import { createContext, useContext, useState, ReactNode } from 'react'

interface ModelItem {
  name: string
  url: string
  author: string
  authorURL: string
  license: string
  licenseURL: string
}

const Models: ModelItem[] = [
  { name: "Kanonenkopf Kampfpanzer", url: 'kanonenkopf-kampfpanzer-rigged.glb', author: '...', authorURL: 'https://sketchfab.com/N01506', license: 'CC BY-NC 4.0', licenseURL: 'https://creativecommons.org/licenses/by-nc/4.0/' },
  { name: "Ship In A Bottle", url: 'ship-in-a-bottle-optimized.glb', author: 'Loïc Norgeot', authorURL: 'https://sketchfab.com/norgeotloic', license: 'CC BY-NC 4.0', licenseURL: 'https://creativecommons.org/licenses/by-nc/4.0/' },
  { name: "Mosquito In Amber", url: 'mosquito-in-amber-optimized.glb', author: 'Loïc Norgeot', authorURL: 'https://sketchfab.com/norgeotloic', license: 'CC BY-NC 4.0', licenseURL: 'https://creativecommons.org/licenses/by-nc/4.0/'  },
  { name: "Mercedes Benz 300SL Gullwing", url: 'mercedes-benz-300sl-gullwing-optimized.glb', author: 'vecarz.com', authorURL: 'https://sketchfab.com/heynic', license: 'CC BY 4.0', licenseURL: 'https://creativecommons.org/licenses/by/4.0/'  },
  { name: "Gelatinous Cube", url: 'gelatinous-cube-optimized.glb', author: 'glenatron', authorURL: 'https://sketchfab.com/glenatron', license: 'CC BY-NC 4.0', licenseURL: 'https://creativecommons.org/licenses/by-nc/4.0/' },
  { name: "Terrarium Bot A", url: 'terrarium-bot-a-optimized.glb', author: 'N01516', authorURL: 'https://sketchfab.com/N01506', license: 'CC BY-NC 4.0', licenseURL: 'https://creativecommons.org/licenses/by-nc/4.0/'},
  { name: "Terrarium Bot B", url: 'terrarium-bot-b-optimized.glb', author: 'N01516', authorURL: 'https://sketchfab.com/N01506', license: 'CC BY-NC 4.0', licenseURL: 'https://creativecommons.org/licenses/by-nc/4.0/' },
  { name: "Ryan Full Body Scan", url: 'ryan-full-body-scan-optimized.glb', author: 'FletchTech', authorURL: 'https://sketchfab.com/FletchTech', license: 'CC BY 4.0', licenseURL: 'https://creativecommons.org/licenses/by/4.0/' },
  { name: "Woman Walking", url: 'woman-walking-optimized.glb', author: ' Arion Digital', authorURL: 'https://sketchfab.com/andrewswihart', license: 'CC BY 4.0', licenseURL: 'https://creativecommons.org/licenses/by/4.0/' },
  { name: "Cesium Man", url: 'cesium-man.glb', author: 'Cesium', authorURL: 'https://github.com/KhronosGroup/glTF-Sample-Assets/blob/main/Models/CesiumMan/README.md', license: 'CC BY-NC 4.0', licenseURL: 'https://creativecommons.org/licenses/by-nc/4.0/'},
  { name: "Duck", url: 'duck.glb', author: 'Sony', authorURL: 'https://github.com/KhronosGroup/glTF-Sample-Assets/tree/main/Models/Duck', license: 'SCEA Shared Source License, Version 1.0', licenseURL: 'https://spdx.org/licenses/SCEA.html' },
]

interface AppContextType {
  models: ModelItem[]
  currentModel: ModelItem
  setCurrentModel: (model: ModelItem) => void
  addModel: (model: ModelItem) => void
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export const AppContextProvider = ({ children }: { children: ReactNode }) => {
  const [models, setModels] = useState<ModelItem[]>(Models)
  const [currentModel, setCurrentModel] = useState<ModelItem>(Models[0])
  const addModel = (model: ModelItem) => {
    setModels(prev => [...prev, model])
    setCurrentModel(model)
  }
  return (
    <AppContext.Provider value={{ models, currentModel, setCurrentModel, addModel }}>
      {children}
    </AppContext.Provider>
  )
}

export const useModels = () => { 
  const context = useContext(AppContext)
  if (!context) throw new Error('useModels must be used within an AppProvider')
  return context
} 