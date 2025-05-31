// TODO: customize the controller
import { DefaultXRControllerOptions, DefaultXRController, useXRInputSourceState } from '@react-three/xr'
import { useFrame } from '@react-three/fiber'

const XRController = (props: DefaultXRControllerOptions) => {
  const controller = useXRInputSourceState('controller', 'right')

  useFrame(() => {
    const thumstickState = controller?.gamepad['xr-standard-thumbstick']
    const y = thumstickState?.yAxis || 0
    if (y > 0)
    console.log('controller: ', y)
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