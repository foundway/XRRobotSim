import { useGLTF } from "@react-three/drei";
import { useEffect, useState } from "react";
import { RenderMode, VFXEmitter, VFXParticles } from "wawa-vfx";

export const CustomGeometry = () => {
  const { nodes } = useGLTF("debris.glb");
  const [burst, setBurst] = useState(true);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setBurst((prev) => !prev);
    }, 2000);
    return () => clearTimeout(timeout);
  }, [burst]);
  return (
    <>
      <VFXParticles
        name="swords"
        geometry={<primitive object={nodes.Debris} />}
        settings={{
          nbParticles: 1000,
          gravity: [0, 0, 0],
          fadeSize: [0.3, 0.95],
          renderMode: RenderMode.Mesh,
          intensity: 2,
        }}
      />

      {burst && (
        <VFXEmitter
          emitter="swords"
          settings={{
            spawnMode: "burst",
            loop: true,
            duration: 1,
            nbParticles: 102,
            startPositionMin: [-5, -5, 0],
            startPositionMax: [5, 5, 0],
            directionMin: [0, 0, 0],
            directionMax: [0, 0, 0],
            size: [0.5, 1],
            particlesLifetime: [1, 1],
            speed: [1, 5],
            colorStart: ["white", "skyblue", "pink"],
            startRotationMin: [0, 0, 0],
            startRotationMax: [Math.PI, Math.PI, Math.PI],
          }}
        />
      )}
    </>
  );
};
useGLTF.preload("debris.glb");