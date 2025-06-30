import { Canvas } from '@react-three/fiber'
import { XR, createXRStore } from '@react-three/xr'
import { Physics } from '@react-three/rapier'
import { Button } from '@/components/ui/button'
import Scene from '@/components/three/Scene'
import { useModels, AppContextProvider } from './context/AppContext'
import XRController from './components/three/XRController'
import { BsHeadsetVr } from "react-icons/bs";
import { useSceneStore, GameMode } from './store/SceneStore'

export const DEBUG = true

const store = createXRStore({
  controller: XRController,
  bounded: false
})

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

const GameModeMenu = () => {
  const { setGlobalScale, setGameMode } = useSceneStore()

  return (
    <span className='absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 gap-12 flex flex-col'>
      <h1 className='text-white font-bold text-center text-8xl text-shadow-lg'>
        XR Robot Simulator
      </h1>
      <p className='text-white text-center text-2xl'>
        Select a mode to start
      </p>
      <span
        className='flex flex-row gap-8'
      >
        <Button
          className="rounded-8px w-80 h-50 cursor-pointer backdrop-blur-lg bg-black/40 hover:bg-black/60 shadow-lg flex flex-col"
          onClick={() => {
            setGameMode(GameMode.TwoMeter)
            setGlobalScale(1)
            store.enterAR()
          }}>
          <p className='text-white text-2xl'>2 Meters</p>
          <p className='text-white text-sm'>Ground control</p>
          <span className='h-4'/>
          <span className='flex flex-row gap-2'>
            <p className='text-white text-sm'>Enter XR</p>
            <BsHeadsetVr size={20} />
          </span>
        </Button>
        <Button
          className="rounded-8px w-80 h-50 cursor-pointer backdrop-blur-lg bg-black/40 hover:bg-black/60 shadow-lg flex flex-col"
          onClick={() => {
            setGameMode(GameMode.TwentyMeter)
            setGlobalScale(10)
            store.enterAR()
          }}>
          <p className='text-white text-2xl'>20 Meters</p>
          <p className='text-white text-sm'>Ground control</p>
          <span className='h-4'/>
          <span className='flex flex-row gap-2'>
            <p className='text-white text-sm'>Enter XR</p>
            <BsHeadsetVr size={20} />
          </span>
        </Button>
        <Button
          className="rounded-8px w-80 h-50 cursor-pointer backdrop-blur-lg bg-black/40 hover:bg-black/60 shadow-lg flex flex-col"
          onClick={() => {
            setGameMode(GameMode.TwentyMeterMounted)
            setGlobalScale(10)
            store.enterAR()
          }}>
          <p className='text-white text-2xl'>20 Meters</p>
          <p className='text-white text-sm'>Mounted control</p>
          <span className='h-4'/>
          <span className='flex flex-row gap-2'>
            <p className='text-white text-sm'>Enter XR</p>
            <BsHeadsetVr size={20} />
          </span>
        </Button>
      </span>
    </span>
  )
}

const App = () => {
  const { paused, globalScale, gameMode } = useSceneStore()

  return (
    <AppContextProvider>
      <div style={{ width: '100vw', height: '100vh', backgroundColor: 'black' }}>
        <Canvas
          className="pointer-events-none" // block inputs while using UIs
          camera={{ fov: 50 }}
          shadows
        >
          <XR store={store}>
            <Physics debug={DEBUG} paused={paused}>
              <Scene key={gameMode} globalScale={globalScale} />
            </Physics>
          </XR>
        </Canvas>
        <div className="pointer-events-auto">
          <GameModeMenu />
          <ModelInfoCard />
        </div>
      </div>
    </AppContextProvider>
  )
}

export default App