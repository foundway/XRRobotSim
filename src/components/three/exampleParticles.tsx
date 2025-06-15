import * as THREE from "three";
import { VFXEmitter, VFXParticles, RenderMode, AppearanceMode } from "wawa-vfx";

const ExampleFX = () => {
  return (
    <>
      <VFXParticles
        name="particles" // A unique identifier for this particle system
        settings={{
          nbParticles: 100000, // Maximum number of particles to allocate
          gravity: [0, -9.8, 0], // Apply gravity (x, y, z)
          fadeSize: [0, 0], // Size fade in/out settings
          fadeAlpha: [0, 0], // Opacity fade in/out settings
          renderMode: RenderMode.Billboard, // "billboard" or "mesh" or "stretchBillboard"
          intensity: 1, // Brightness multiplier
          appearance: AppearanceMode.Square, // Define the default appearance to be plane (default) or circular
          easeFunction: "easeLinear", // add easing to the particle animations (see EaseFunction in vfxs/types.ts)
        }}
        alphaMap={new THREE.TextureLoader().load("https://rawcdn.githack.com/pmndrs/drei-assets/9225a9f1fbd449d9411125c2f419b843d0308c9f/cloud.png")}
      />

      <VFXEmitter
        debug // Show debug visualization
        emitter="particles" // Target the particle system by name
        localDirection={true}
        settings={{
          loop: true, // Continuously emit particles (only if `spawnMode` is 'time')
          duration: 1, // Emission cycle duration in seconds
          nbParticles: 100, // Number of particles to emit per cycle
          spawnMode: "time", // Emission mode: 'time' or 'burst'
          delay: 0, // Time delay before starting emission
          particlesLifetime: [0.1, 1],

          size: [0.1, 1],
          speed: [1, 5],

          startPositionMin: [-0.1, -0.1, -0.1],
          startPositionMax: [0.1, 0.1, 0.1],

          directionMin: [-0.5, 0, -0.5],
          directionMax: [0.5, 1, 0.5],

          startRotationMin: [0, 0, -Math.PI],
          startRotationMax: [0, 0, Math.PI],
          rotationSpeedMin: [0, 0, -30],
          rotationSpeedMax: [0, 0, 30],

          colorStart: ["orange"],
          colorEnd: ["red"],
        }}
      />
    </>
  );
};

export default ExampleFX;