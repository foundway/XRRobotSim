import { Canvas } from '@react-three/fiber'
import { PerspectiveCamera } from '@react-three/drei' 
import { XR, createXRStore } from '@react-three/xr'
import { Physics } from '@react-three/rapier'
import { Button } from '@/components/ui/button'
import Scene from '@/components/three/Scene'
import { useModels, AppContextProvider } from './context/AppContext'
import XRController from './components/three/XRController'
import { useSceneStore, GameMode } from './store/SceneStore'
import { LuMenu } from "react-icons/lu";
import { useState, useRef } from 'react'
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing'

const store = createXRStore({
  controller: XRController,
  bounded: false
})

const GAME_MODE_BUTTON_CLASS = "rounded-xl w-50 h-20 cursor-pointer backdrop-blur-lg bg-black/30 hover:bg-black/50 shadow-lg flex flex-col"

// Reusable menu item button
const MenuItemButton = ({ onClick, children }: { onClick: () => void, children: React.ReactNode }) => (
  <Button 
    variant="ghost" 
    className='text-white hover:bg-black/10 hover:text-white cursor-pointer text-left justify-start' 
    onClick={onClick}
  >
    {children}
  </Button>
)

const ModelInfoCard = () => {
  const { currentModel } = useModels();
  
  return (
    <div className="absolute bottom-8 left-8 bg-black/10 backdrop-blur-md rounded-xl px-4 py-3 text-white border border-white/10">
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

const GameModeMenu = () => {
  const { setGlobalScale, setGameMode } = useSceneStore()

  return (
    <div className='bg-black/10 backdrop-blur-md rounded-xl px-12 py-8 text-white absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 gap-6 flex flex-col border-1 border-white/20'>
      <h1 className='text-white font-bold text-center text-6xl text-shadow-lg'>
        XR Robot Sim
      </h1>
      <p className='text-white text-center text-2xl'>
        Select a mode to start
      </p>
      <span
        className='flex flex-row gap-8'
      >
        <Button
          className={GAME_MODE_BUTTON_CLASS}
          onClick={() => {
            setGameMode(GameMode.TwoMeter)
            setGlobalScale(1)
            store.enterAR()
          }}>
          <p className='text-white text-2xl font-bold'>2-meter</p>
          <p className='text-white text-sm'>Ground control</p>
        </Button>
        <Button
          className={GAME_MODE_BUTTON_CLASS}
          onClick={() => {
            setGameMode(GameMode.TwentyMeter)
            setGlobalScale(10)
            store.enterAR()
          }}>
          <p className='text-white text-2xl font-bold'>20-meter</p>
          <p className='text-white text-sm'>Ground control</p>
        </Button>
        <Button
          className={GAME_MODE_BUTTON_CLASS}
          onClick={() => {
            setGameMode(GameMode.TwentyMeterMounted)
            setGlobalScale(10)
            store.enterAR()
          }}>
          <p className='text-white text-2xl font-bold'>20-meter</p>
          <p className='text-white text-sm'>Mounted control</p>
        </Button>
      </span>
    </div>
  )
}

const SettingsMenu = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [menuClickCount, setMenuClickCount] = useState(0)
  const menuRef = useRef<HTMLDivElement>(null)
  const menuTriggerRef = useRef<HTMLButtonElement>(null)
  const { debug, setDebug } = useSceneStore()

  const handleMenuTriggerClick = () => {
    setIsOpen(!isOpen)
    setMenuClickCount((count) => count + 1)
  }

  return (
    <>
      <Button 
        ref={menuTriggerRef} 
        className='absolute top-4 left-4 bg-opacity-0 hover:bg-black/10 hover:backdrop-blur-lg rounded-md p-2 cursor-pointer' 
        onClick={handleMenuTriggerClick}
      >
        <LuMenu className='text-[24px] text-white' />
      </Button>
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div ref={menuRef} className="absolute top-14 left-4 flex flex-col gap-2 bg-black/20 backdrop-blur-md rounded-xl p-4 text-white shadow-xl z-50 border-1 border-white/20">
            <MenuItemButton onClick={() => setIsOpen(false)}>
              <p>About XR Robot Sim</p>
            </MenuItemButton>
            <MenuItemButton onClick={() => setIsOpen(false)}>
              <p>License & Attributions</p>
            </MenuItemButton>
            {menuClickCount >= 10 && (
              <MenuItemButton onClick={() => { setIsOpen(false); setDebug(!debug); }}>
                <p>Developing Mode</p>
              </MenuItemButton>
            )}
          </div>
        </>
      )}
    </>
  )
}

const App = () => {
  const { paused, globalScale, gameMode, debug } = useSceneStore()

  return (
    <AppContextProvider>
      <div style={{ width: '100vw', height: '100vh', backgroundColor: 'black' }}>
        <Canvas
          className="pointer-events-none" 
          shadows
        >
          <PerspectiveCamera key={gameMode} fov={50} makeDefault position={[-1, 0.5, -6]} />
          <XR store={store}>
            <Physics debug={debug} paused={paused}>
              <Scene key={gameMode} globalScale={globalScale}  />
            </Physics>
          </XR>
          {gameMode === GameMode.None && (
            <EffectComposer>
              <Bloom intensity={0.2} luminanceThreshold={0.9} />
              <Vignette darkness={0.5} size={1} offset={0.5} />
            </EffectComposer>
          )}
        </Canvas>
        <div className="pointer-events-auto">
          <GameModeMenu />
          <ModelInfoCard />
          <SettingsMenu />
        </div>
      </div>
    </AppContextProvider>
  )
}

export default App