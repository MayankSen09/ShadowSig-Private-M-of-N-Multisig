"use client";

import { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function ParticleField() {
  const points = useRef<THREE.Points>(null!);
  const count = 80;
  const velocitiesRef = useRef<{ x: number; y: number; z: number }[]>([]);

  const { positions, initialVelocities } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel: { x: number; y: number; z: number }[] = [];
    for (let i = 0; i < count; i++) {
      // Deterministic values to comply with react-hooks/purity
      const r1 = Math.sin(i * 12.9898) * 43758.5453;
      const rnd1 = r1 - Math.floor(r1);
      const r2 = Math.sin(i * 78.233) * 43758.5453;
      const rnd2 = r2 - Math.floor(r2);
      const r3 = Math.sin(i * 45.164) * 43758.5453;
      const rnd3 = r3 - Math.floor(r3);
      const r4 = Math.sin(i * 92.837) * 43758.5453;
      const rnd4 = r4 - Math.floor(r4);
      const r5 = Math.sin(i * 23.948) * 43758.5453;
      const rnd5 = r5 - Math.floor(r5);
      const r6 = Math.sin(i * 67.283) * 43758.5453;
      const rnd6 = r6 - Math.floor(r6);

      pos[i * 3] = (rnd1 - 0.5) * 12;
      pos[i * 3 + 1] = (rnd2 - 0.5) * 8;
      pos[i * 3 + 2] = (rnd3 - 0.5) * 6;
      vel.push({
        x: (rnd4 - 0.5) * 0.005,
        y: (rnd5 - 0.5) * 0.005,
        z: (rnd6 - 0.5) * 0.003,
      });
    }
    return { positions: pos, initialVelocities: vel };
  }, []);

  useEffect(() => {
    velocitiesRef.current = initialVelocities.map((v) => ({ ...v }));
  }, [initialVelocities]);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [positions]);

  useFrame((state) => {
    if (!points.current || velocitiesRef.current.length === 0) return;
    const posArr = points.current.geometry.attributes.position.array as Float32Array;
    const vels = velocitiesRef.current;
    for (let i = 0; i < count; i++) {
      posArr[i * 3] += vels[i].x;
      posArr[i * 3 + 1] += vels[i].y;
      posArr[i * 3 + 2] += vels[i].z;
      if (Math.abs(posArr[i * 3]) > 6) vels[i].x *= -1;
      if (Math.abs(posArr[i * 3 + 1]) > 4) vels[i].y *= -1;
      if (Math.abs(posArr[i * 3 + 2]) > 3) vels[i].z *= -1;
    }
    points.current.geometry.attributes.position.needsUpdate = true;
    points.current.rotation.y = state.clock.elapsedTime * 0.02;
  });

  return (
    <points ref={points} geometry={geometry}>
      <pointsMaterial size={0.06} color="#00e1ff" transparent opacity={0.8} sizeAttenuation />
    </points>
  );
}

export function HeroVisualization() {
  return (
    <div className="absolute inset-0 opacity-60">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 50 }}
        style={{ background: "transparent" }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight intensity={0.5} />
        <ParticleField />
      </Canvas>
    </div>
  );
}
