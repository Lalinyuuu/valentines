"use client";

import { useRef, useState, useEffect } from "react";
import { Group } from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment } from "@react-three/drei";
import { Suspense } from "react";

function useResponsiveScale(desktopScale: number, mobileScale: number, breakpoint = 768) {
  const [scale, setScale] = useState(desktopScale);

  useEffect(() => {
    const update = () => {
      setScale(window.innerWidth < breakpoint ? mobileScale : desktopScale);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [desktopScale, mobileScale, breakpoint]);

  return scale;
}

function FlowerModel() {
  const groupRef = useRef<Group>(null);
  const { scene } = useGLTF("/models/flower.glb");
  const scale = useResponsiveScale(3.5, 2.2);

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (group && typeof group.rotation?.y === "number") {
      group.rotation.y += delta * 0.15;
    }
  });

  return (
    <group ref={groupRef}>
      <primitive object={scene} scale={scale} position={[0, -0.2, 0]} />
    </group>
  );
}

function FlowerScene() {
  return (
    <>
      <ambientLight intensity={0.8} />
      <spotLight
        position={[10, 10, 10]}
        angle={0.15}
        penumbra={1}
        intensity={1}
      />
      <pointLight position={[-10, -10, -10]} intensity={0.5} />

      <Suspense fallback={null}>
        <FlowerModel />
        <Environment preset="sunset" />
      </Suspense>

      <OrbitControls
        enableZoom={true}
        enablePan={false}
        minDistance={5}
        maxDistance={7}
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={(3 * Math.PI) / 4}
        minAzimuthAngle={-Math.PI / 1.8}
        maxAzimuthAngle={Math.PI / 1.8}
      />
    </>
  );
}

export default function FlowerCanvas() {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [0, 0, 6], fov: 40 }}
      style={{ background: "transparent" }}
      gl={{ alpha: true, preserveDrawingBuffer: true }}
    >
      <FlowerScene />
    </Canvas>
  );
}
