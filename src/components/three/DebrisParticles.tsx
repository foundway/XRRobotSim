import { useGLTF } from "@react-three/drei";
import { TextureLoader } from "three";
import { SkeletonUtils } from "three-stdlib";
import { VFXParticles, RenderMode } from "wawa-vfx";

const DebrisParticles = () => {
  // const { scene } = useGLTF("debris.glb");
  // const debris = SkeletonUtils.clone(scene);

  return (
    <VFXParticles
      name="debris" // A unique identifier for this particle system
      alphaMap={new TextureLoader().load("debris.png")}
      // geometry={<primitive object={debris} />}
      settings={{
        nbParticles: 10000, // Maximum number of particles to allocate
        gravity: [0, -9.8, 0], // Apply gravity (x, y, z)
        fadeSize: [0.15, 0], // Size fade in/out settings
        fadeAlpha: [0.15, 0], // Opacity fade in/out settings
        renderMode: RenderMode.Billboard, 
        intensity: 2, // Brightness multiplier
        frustumCulled: false,
      }}
    />
  );
};

export default DebrisParticles;