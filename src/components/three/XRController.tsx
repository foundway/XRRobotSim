import { DefaultXRControllerOptions, DefaultXRController, useXRInputSourceStateContext } from '@react-three/xr'
import { Box } from '@react-three/drei'
import { useSceneStore } from '@/store/SceneStore'

const XRController = (props: DefaultXRControllerOptions) => {
  const context = useXRInputSourceStateContext()
  const { rightControllerRef, leftControllerRef } = useSceneStore()
  const { debug } = useSceneStore()

  return (
    <>
      <DefaultXRController
        rayPointer={{ minDistance: 0.01 }}
        grabPointer={false}
        teleportPointer={false}
        {...props}
      />

      {context?.inputSource.handedness === 'right' && 
      <group ref={rightControllerRef}>
        {debug && <Box args={[0.04, 0.04, 0.04]} position={[0, 0, 0]} rotation={[0, 0, 0]}>
          <meshBasicMaterial color="green" wireframe={true} />
        </Box>}
      </group>}

      {context?.inputSource.handedness === 'left' && 
      <group ref={leftControllerRef}>
        {debug && <Box args={[0.04, 0.04, 0.04]} position={[0, 0, 0]}>
          <meshBasicMaterial color="red" wireframe={true} />
        </Box>}
      </group>}
    </>
  )
}

export default XRController; 