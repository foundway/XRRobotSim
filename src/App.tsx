import React from 'react'
import { useRef } from 'react'
import { Canvas } from '@react-three/fiber'
import { XR, createXRStore } from '@react-three/xr'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select"

import Scene from '@/components/three/Scene'
import { useModels, AppContextProvider } from './context/AppContext'
import { BsHeadsetVr } from "react-icons/bs";
import { MdOutlineFileUpload } from "react-icons/md";
import XRController from './components/three/XRController'

const ModelInfoCard = () => {
  const { currentModel } = useModels();
  
  return (
    <div className="absolute bottom-8 left-8 bg-black/40 backdrop-blur-md rounded-xl px-4 py-3 text-white border border-white/10">
      <h3 className="text-small font-semibold mb-2">{currentModel.name}</h3>
      <div className="space-y-1 text-sm text-gray-300">
        <p>
          <span className="font-small">Author: </span>
          {currentModel.authorURL ? (
            <a href={currentModel.authorURL} target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:text-blue-200 underline" >
              {currentModel.author}
            </a>
          ) : ('Unknown')}
        </p>
        <p><span className="font-small">License: </span>
          {currentModel.licenseURL ? (
          <a href={currentModel.licenseURL} target="_blank" rel="noopener noreferrer" className="text-blue-300 hover:text-blue-200 underline" >
              {currentModel.license}
            </a>
          ) : ('Unknown')}
        </p>
      </div>
    </div>
  )
}

const ModelSelect = () => {
  const { models, currentModel, setCurrentModel } = useModels();

  const handleChange = (value: string) => {
    const found = models.find((m) => m.url === value);
    if (found) setCurrentModel(found);
  };

  return (
    <div>
      <Select value={currentModel.url} onValueChange={handleChange}>
        <SelectTrigger className="bg-neutral-900 text-white rounded-full border-none p-6 hover:bg-gray-800 transition-colors cursor-pointer">
          <SelectValue placeholder="Select a model" />
        </SelectTrigger>
        <SelectContent className="bg-neutral-900 text-white border-none p-1">
          <SelectGroup>
            {models.map((model) => (
              <SelectItem 
                key={model.url} 
                value={model.url}
                className="hover:bg-gray-800 cursor-pointer transition-colors"
              >
                {model.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  )
}

const UploadButton = () => {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { addModel } = useModels()

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      const name = file.name.replace(/\.[^/.]+$/, "") // Remove extension for display
      addModel({ name, url, author: 'User Upload', authorURL: 'n/a', license: 'User Upload', licenseURL: 'n/a' })
    }
  }
  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        accept=".glb"
        onChange={handleFileUpload}
        className="hidden"
      />
      <Button
        className="rounded-full gap-1 h-12 hover:bg-gray-800 cursor-pointer"
        onClick={() => fileInputRef.current?.click()}
      >
        <MdOutlineFileUpload size={20} />
        <p className="text-white text-xs">(.glb)</p>
      </Button>
    </>
  )
}

const store = createXRStore({
  controller: XRController,
  bounded: false
})

const App = () => {
  return (
    <AppContextProvider>
      <div style={{ width: '100vw', height: '100vh', backgroundColor: 'black' }}>
        <Canvas
          className="pointer-events-none" // block inputs while using UIs
          camera={{ fov: 50 }}
          shadows
        >
          <XR store={store}>
            <Scene />
          </XR>
        </Canvas>
        <div className="pointer-events-auto">
          <span className='absolute left-8 top-8 gap-4 flex flex-row '>
            <ModelSelect />
            <UploadButton />
          </span>
          <ModelInfoCard />
          <Button
            className="absolute top-8 right-8 rounded-full gap-3 p-6 hover:bg-gray-800 cursor-pointer"
            onClick={() => store.enterAR()}>
            <BsHeadsetVr size={20} />
            Enter XR
          </Button>
        </div>
      </div>
    </AppContextProvider>
  )
}

export default App