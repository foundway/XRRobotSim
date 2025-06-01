// TODO: customize the controller
import { DefaultXRControllerOptions, DefaultXRController, useXRInputSourceState } from '@react-three/xr'
import { useFrame } from '@react-three/fiber'
import { useAnimationStore } from '@/store/AnimationStore'

const XRController = (props: DefaultXRControllerOptions) => {
  const controller = useXRInputSourceState('controller', 'right')
  const { addRotation } = useAnimationStore()
  const DEADZONE = 0.1
  const ROTATION_SPEED = -0.01

  useFrame(() => {
    const thumstickState = controller?.gamepad['xr-standard-thumbstick']
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
    </>
  )
}

export default XRController; 