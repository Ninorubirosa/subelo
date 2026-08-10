'use client'

import { useMemo, useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Sparkles } from '@react-three/drei'
import * as THREE from 'three'

const BAR_COUNT = 48
const LIME = '#38B6FF'
const ASSEMBLE_DURATION = 1.1

function AssemblingBars({ reduced }: { reduced: boolean }) {
  const groupRef = useRef<THREE.Group>(null)
  const bars = useMemo(
    () =>
      Array.from({ length: BAR_COUNT }, (_, i) => {
        const targetHeight = 0.4 + Math.sin(i * 0.4) * 1.1 + Math.random() * 0.5
        const start = new THREE.Vector3(
          (Math.random() - 0.5) * 14,
          (Math.random() - 0.5) * 8,
          (Math.random() - 0.5) * 8
        )
        const target = new THREE.Vector3((i - BAR_COUNT / 2) * 0.22, 0, 0)
        return { start, target, targetHeight, delay: Math.random() * 0.3 }
      }),
    []
  )

  useFrame((state) => {
    if (!groupRef.current) return
    const t = reduced ? ASSEMBLE_DURATION : state.clock.getElapsedTime()
    groupRef.current.children.forEach((mesh, i) => {
      const b = bars[i]
      const localT = Math.min(1, Math.max(0, (t - b.delay) / (ASSEMBLE_DURATION - b.delay)))
      const eased = 1 - Math.pow(1 - localT, 3)
      mesh.position.lerpVectors(b.start, b.target, eased)
      mesh.scale.y = 0.15 + (b.targetHeight - 0.15) * eased
    })
  })

  return (
    <group ref={groupRef}>
      {bars.map((_, i) => (
        <mesh key={i}>
          <boxGeometry args={[0.09, 1, 0.09]} />
          <meshStandardMaterial color={LIME} emissive={LIME} emissiveIntensity={1.1} toneMapped={false} />
        </mesh>
      ))}
    </group>
  )
}

export function IntroScene({ reduced }: { reduced: boolean }) {
  return (
    <Canvas
      flat
      camera={{ position: [0, 0.6, 7], fov: 45 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
      fallback={<div className="w-full h-full bg-background" />}
    >
      <ambientLight intensity={0.08} />
      <pointLight position={[0, 2, 4]} intensity={8} color={LIME} />
      <AssemblingBars reduced={reduced} />
      <Sparkles count={60} scale={[12, 6, 4]} size={2} speed={reduced ? 0.05 : 0.3} color={LIME} opacity={0.5} />
    </Canvas>
  )
}
