"use client";

import { useRef, useMemo, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function ParticleField() {
  const points = useRef<THREE.Points>(null!);
  const count = 80;

  const { positions, velocities } = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const vel: THREE.Vector3[] = [];
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 12;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 8;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 6;
      vel.push(new THREE.Vector3(
        (Math.random() - 0.5) * 0.005,
        (Math.random() - 0.5) * 0.005,
        (Math.random() - 0.5) * 0.003
      ));
    }
    return { positions: pos, velocities: vel };
  }, []);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [positions]);

  useFrame((state) => {
    if (!points.current) return;
    const posArr = points.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      posArr[i * 3] += velocities[i].x;
      posArr[i * 3 + 1] += velocities[i].y;
      posArr[i * 3 + 2] += velocities[i].z;
      if (Math.abs(posArr[i * 3]) > 6) velocities[i].x *= -1;
      if (Math.abs(posArr[i * 3 + 1]) > 4) velocities[i].y *= -1;
      if (Math.abs(posArr[i * 3 + 2]) > 3) velocities[i].z *= -1;
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
