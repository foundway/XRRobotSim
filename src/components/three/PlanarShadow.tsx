import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface PlanarShadowProps {
  targetRef: React.RefObject<THREE.Object3D | null>;
  spaceRef?: React.RefObject<THREE.Object3D | null>;
  size?: number;
  intensity?: number;
  elevation?: number;
  attenuation?: number;
}

const PlanarShadow = ({
  targetRef,
  size = 1,
  intensity = 1,
  elevation = 0.001,
  attenuation = 1,
}: PlanarShadowProps) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const spaceRef = useRef<THREE.Group>(null);
  useFrame(() => {
    if (targetRef.current && meshRef.current) {
      const worldPos = targetRef.current.getWorldPosition(new THREE.Vector3());
      const localPos = worldPos.clone();
      spaceRef.current?.worldToLocal(localPos);
      meshRef.current.position.set(localPos.x, elevation, localPos.z);
      const strength = intensity * Math.max(0, 1 - localPos.y * attenuation);
      const mat = meshRef.current.material as THREE.ShaderMaterial;
      if (mat.uniforms) {
        mat.uniforms.shadowStrength.value = strength;
      }
    }
  });
  return (
    <group ref={spaceRef}>
      <mesh ref={meshRef} rotation={[-Math.PI/2, 0, 0]}>
        <planeGeometry args={[size, size]} />
        <shaderMaterial
          attach="material"
          vertexShader={`
            varying vec2 vUv;
            void main() {
              vUv = uv;
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `}
          fragmentShader={`
            varying vec2 vUv;
            uniform float shadowStrength;
            uniform vec3 color;
            void main() {
              float dist = distance(vUv, vec2(0.5, 0.5));
              float shadow = smoothstep(0.3, 0.05, dist);
              float alpha = shadow * shadowStrength;
              gl_FragColor = vec4(color, alpha);
            }
          `}
          uniforms={{
            shadowStrength: { value: intensity },
            color: { value: new THREE.Color('black') },
          }}
          transparent={true}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
};

export default PlanarShadow; 