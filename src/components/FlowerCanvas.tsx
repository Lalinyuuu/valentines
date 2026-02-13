"use client";

import React, { useRef, useState, useEffect, Component, ReactNode } from "react";
import { Group } from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment } from "@react-three/drei";
import { Suspense } from "react";

/* ── Error Boundary ── */
interface EBProps { fallback: ReactNode; children: ReactNode }
interface EBState { hasError: boolean }

class CanvasErrorBoundary extends Component<EBProps, EBState> {
  constructor(props: EBProps) {
    super(props);
    this.state = { hasError: false };
  }
  static getDerivedStateFromError() {
    return { hasError: true };
  }
  render() {
    if (this.state.hasError) return this.props.fallback;
    return this.props.children;
  }
}

/* ── Fallback (when 3D fails) ── */
function FlowerFallback() {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: "rgba(90,74,90,0.7)",
        gap: "0.75rem",
      }}
    >
      <span style={{ fontSize: "4rem" }}>💐</span>
      <p style={{ margin: 0, fontSize: "0.85rem", textAlign: "center" }}>
        Your bouquet is here — just imagine it in 3D!
      </p>
    </div>
  );
}

/* ── Responsive scale hook ── */
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

/* ── 3D Model ── */
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

/* ── 3D Scene ── */
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

/* ── Main Export ── */
export default function FlowerCanvas() {
  return (
    <CanvasErrorBoundary fallback={<FlowerFallback />}>
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 0, 6], fov: 40 }}
        style={{ background: "transparent" }}
        gl={{
          alpha: true,
          preserveDrawingBuffer: true,
          antialias: true,
          powerPreference: "default",
          failIfMajorPerformanceCaveat: false,
        }}
      >
        <FlowerScene />
      </Canvas>
    </CanvasErrorBoundary>
  );
}
