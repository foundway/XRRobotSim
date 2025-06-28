import { useGLTF } from "@react-three/drei";
import { VFXParticles, RenderMode } from "wawa-vfx";

const DebrisParticles = () => {
  const { nodes } = useGLTF("debris.glb");

  return (
    <VFXParticles
      name="debris" // A unique identifier for this particle system
      geometry={<primitive object={nodes.Debris} />}
      settings={{
        nbParticles: 10000, // Maximum number of particles to allocate
        gravity: [0, 0, 0], // Apply gravity (x, y, z)
        fadeSize: [0, 0.5], // Size fade in/out settings
        renderMode: RenderMode.Mesh, 
        intensity: 1, // Brightness multiplier
      }}
    />
  );
};

export default DebrisParticles;