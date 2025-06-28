import { TextureLoader } from "three";
import { VFXParticles, RenderMode, AppearanceMode } from "wawa-vfx";

export const DebrisParticles = () => {
  return (
    <VFXParticles
      name="debris"
      alphaMap={new TextureLoader().load("debris.png")}
      settings={{
        intensity: 1,
        nbParticles: 1000,
        gravity: [0, -9.8, 0],
        fadeSize: [0.15, 0],
        fadeAlpha: [0.15, 0],
        renderMode: RenderMode.Billboard,
        frustumCulled: false,
      }}
    />
  );
};

export const SparksParticles = () => {
  return (
    <VFXParticles
      name="sparks"
      settings={{
        intensity: 2,
        nbParticles: 1000,
        gravity: [0, -9.8, 0],
        fadeSize: [0, 0],
        fadeAlpha: [0, 0],
        easeFunction: "easeLinear",
        renderMode: RenderMode.StretchBillboard,
        appearance: AppearanceMode.Circular,
        frustumCulled: false,
      }}
    />
  );
}; 

export const FlareParticles = () => {
  return (
    <VFXParticles
      name="flare"
      alphaMap={new TextureLoader().load("flare.png")}
      settings={{
        intensity: 3,
        nbParticles: 1000,
        gravity: [0, 0, 0],
        fadeSize: [1, 1],
        fadeAlpha: [0.2, 0],
        renderMode: RenderMode.Billboard,
        frustumCulled: false,
      }}
    />
  );
}; 