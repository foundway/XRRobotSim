import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { DefaultXRControllerOptions, DefaultXRController, useXRInputSourceState, useXRInputSourceStateContext } from '@react-three/xr'
import { useFrame } from '@react-three/fiber'
import { Box } from '@react-three/drei'
import { useAnimationStore } from '@/store/AnimationStore'

const XRController = (props: DefaultXRControllerOptions) => {
  const context = useXRInputSourceStateContext()
  const rightController = useXRInputSourceState('controller', 'right')
  const { addOrientation: addRotation } = useAnimationStore()
  const DEADZONE = 0.1
  const ROTATION_SPEED = -0.01
  // const leftAnchor = useRef<THREE.Group>(null)
  // const rightAnchor = useRef<THREE.Group>(null)

  useFrame(() => {
    const thumstickState = rightController?.gamepad['xr-standard-thumbstick']
    const x = thumstickState?.xAxis || 0
    if (Math.abs(x) > DEADZONE) {
      addRotation(x * ROTATION_SPEED)
    }
  })

  return (
    <>
      <DefaultXRController
        rayPointer={{ minDistance: 0.01 }}
        grabPointer={false}
        teleportPointer={false}
        {...props}
      />
      {context?.inputSource.handedness === 'right' && 
      <group>
        <Box args={[0.04, 0.04, 0.04]} position={[0, 0, 0]} rotation={[0, 0, 0]}>
          <meshBasicMaterial color="green" wireframe={true} />
        </Box>
      </group>}
      {context?.inputSource.handedness === 'left' && 
      <group>
        <Box args={[0.04, 0.04, 0.04]} position={[0, 0, 0]}>
          <meshBasicMaterial color="red" wireframe={true} />
        </Box>
      </group>}
    </>
  )
}

export default XRController; 