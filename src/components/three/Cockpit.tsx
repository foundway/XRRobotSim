import { Group, Mesh, Object3D, Vector3 } from 'three'
import { useFrame } from '@react-three/fiber'
import { useRef, RefObject } from 'react'
import { useXRInputSourceState, XRSpace } from '@react-three/xr'
import { useSceneStore } from '@/store/SceneStore'

const CHEST_TO_CAMERA_OFFSET = 0.3

const getHorizontalDirectionToCharacter = (cameraPosition: Vector3, characterPosition: Vector3): Vector3 => {
  const direction = new Vector3()
  direction.subVectors(characterPosition, cameraPosition)
  direction.y = 0 // Ignore height difference
  direction.normalize()
  return direction
}

const useCockpitTracking = ( cockpitRef: RefObject<any>, characterPosition: Vector3) => {
  useFrame((state) => {
    if (cockpitRef.current) {
      cockpitRef.current.position.copy(state.camera.position)
      cockpitRef.current.position.y = state.camera.position.y - CHEST_TO_CAMERA_OFFSET
      
      const direction = getHorizontalDirectionToCharacter(state.camera.position, characterPosition)
      const angleY = Math.atan2(direction.x, direction.z) // Calculate Y rotation to face the character
      cockpitRef.current.rotation.set(0, angleY, 0) // Set rotation only around Y axis
    }
  })
}

export const Cockpit = () => {
  const { cockpitRef } = useSceneStore()
  const parentRef = useRef<any>(null)
  const rightControllerRef = useRef<any>(null)
  const leftControllerRef = useRef<any>(null)
  const characterPosition = new Vector3(0, 0, -3) // Character position from Character component
  const rightController = useXRInputSourceState('controller', 'right')
  const leftController = useXRInputSourceState('controller', 'left')

  useCockpitTracking(cockpitRef, characterPosition)

  return (
      <>
      <group ref={cockpitRef}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[1, 0, 1]} />
          <meshBasicMaterial color="blue" wireframe={true} />
        </mesh>
      </group>
      <group ref={parentRef}>
        {rightController?.inputSource?.targetRaySpace && ( // Get controller transform in target ray space. TODO: There might be a better way to do this.
          <XRSpace ref={rightControllerRef} space={rightController.inputSource.targetRaySpace} >
            <axesHelper args={[0.2]} />
          </XRSpace>
        )}
        {leftController?.inputSource?.targetRaySpace && ( // Get controller transform in target ray space. TODO: There might be a better way to do this.
          <XRSpace ref={leftControllerRef} space={leftController.inputSource.targetRaySpace}>
            <axesHelper args={[0.2]} />
          </XRSpace>
        )}
      </group>
    </>
  )
} 