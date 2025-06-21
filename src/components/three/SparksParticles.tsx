import { VFXParticles, RenderMode, AppearanceMode } from "wawa-vfx";

const SparksParticles = () => {
  return (
    <VFXParticles
      name="sparks" // A unique identifier for this particle system
      settings={{
        nbParticles: 100000, // Maximum number of particles to allocate
        gravity: [0, -9.8, 0], // Apply gravity (x, y, z)
        fadeSize: [0, 0], // Size fade in/out settings
        fadeAlpha: [0, 0], // Opacity fade in/out settings
        renderMode: RenderMode.StretchBillboard, // "billboard" or "mesh" or "stretchBillboard"
        intensity: 2, // Brightness multiplier
        appearance: AppearanceMode.Circular, // Define the default appearance to be plane (default) or circular
        easeFunction: "easeLinear", // add easing to the particle animations (see EaseFunction in vfxs/types.ts)
        frustumCulled: false
      }}
    />
  );
};

export default SparksParticles;