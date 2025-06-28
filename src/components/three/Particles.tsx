import { TextureLoader } from "three";
import { VFXParticles, RenderMode, AppearanceMode } from "wawa-vfx";

export const DebrisParticles = () => {
  return (
    <VFXParticles
      name="debris"
      alphaMap={new TextureLoader().load("debris.png")}
      settings={{
        nbParticles: 1000,
        gravity: [0, -9.8, 0],
        fadeSize: [0.15, 0],
        fadeAlpha: [0.15, 0],
        renderMode: RenderMode.Billboard,
        intensity: 2,
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
        nbParticles: 1000,
        gravity: [0, -9.8, 0],
        fadeSize: [0, 0],
        fadeAlpha: [0, 0],
        renderMode: RenderMode.StretchBillboard,
        intensity: 2,
        appearance: AppearanceMode.Circular,
        easeFunction: "easeLinear",
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
        nbParticles: 1000,
        gravity: [0, 0, 0],
        fadeSize: [1, 1],
        fadeAlpha: [0.2, 0],
        renderMode: RenderMode.Billboard,
        intensity: 10,
        frustumCulled: false,
      }}
    />
  );
}; 