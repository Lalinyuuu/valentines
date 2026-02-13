"use client";

import { useRef, useState } from "react";
import { Group } from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, useGLTF, Environment } from "@react-three/drei";
import { Suspense } from "react";

function FlowerModel() {
  const groupRef = useRef<Group>(null);
  const { scene } = useGLTF("/models/flower.glb");

  useFrame((_, delta) => {
    const group = groupRef.current;
    if (group && typeof group.rotation?.y === "number") {
      group.rotation.y += delta * 0.15;
    }
  });

  return (
    <group ref={groupRef}>
      <primitive object={scene} scale={3.5} position={[0, -0.2, 0]} />
    </group>
  );
}

function LoadingBox() {
  return (
    <mesh>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color="#ffb3d9" wireframe />
    </mesh>
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

      <Suspense fallback={<LoadingBox />}>
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
  const [error, setError] = useState<string | null>(null);

  if (error) {
    return (
      <div style={{ 
        width: '100%', 
        height: '100%', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        color: 'rgba(107, 91, 107, 0.6)',
        textAlign: 'center',
        padding: '2rem'
      }}>
        <div>
          <p>3D model couldn't load</p>
          <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>Try refreshing or use desktop</p>
        </div>
      </div>
    );
  }

  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 40 }}
      style={{ background: "transparent" }}
      gl={{ 
        alpha: true, 
        preserveDrawingBuffer: true,
        antialias: true,
        powerPreference: "high-performance"
      }}
      onCreated={({ gl }) => {
        gl.setClearColor(0x000000, 0);
      }}
      onError={(err) => {
        console.error("Canvas error:", err);
        setError("Failed to load 3D");
      }}
    >
      <FlowerScene />
    </Canvas>
  );
}
