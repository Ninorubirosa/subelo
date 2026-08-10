'use client'

import { useMemo, useRef, useState, useEffect } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, Sparkles } from '@react-three/drei'
import * as THREE from 'three'

const BAR_COUNT = 48
const LIME = '#38B6FF'

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setReduced(mq.matches)
    const handler = (e: MediaQueryListEvent) => setReduced(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])
  return reduced
}

function WaveformBars({ reduced }: { reduced: boolean }) {
  const groupRef = useRef<THREE.Group>(null)
  const heights = useMemo(
    () => Array.from({ length: BAR_COUNT }, (_, i) => 0.4 + Math.sin(i * 0.4) * 1.1 + Math.random() * 0.5),
    []
  )

  useFrame((state) => {
    if (!groupRef.current) return
    const t = state.clock.getElapsedTime() * (reduced ? 0.05 : 1)
    groupRef.current.children.forEach((bar, i) => {
      const base = heights[i]
      const scale = base + Math.sin(t * 1.4 + i * 0.3) * (reduced ? 0.05 : 0.3)
      bar.scale.y = Math.max(0.15, scale)
    })
  })

  return (
    <group ref={groupRef}>
      {heights.map((h, i) => (
        <mesh key={i} position={[(i - BAR_COUNT / 2) * 0.22, 0, 0]} scale={[1, h, 1]}>
          <boxGeometry args={[0.09, 1, 0.09]} />
          <meshStandardMaterial color={LIME} emissive={LIME} emissiveIntensity={reduced ? 0.7 : 1.1} toneMapped={false} />
        </mesh>
      ))}
    </group>
  )
}

function Scene() {
  const reduced = usePrefersReducedMotion()

  return (
    <>
      <ambientLight intensity={0.08} />
      <pointLight position={[0, 2, 4]} intensity={8} color={LIME} />
      <Float speed={reduced ? 0.2 : 1} rotationIntensity={reduced ? 0.05 : 0.35} floatIntensity={reduced ? 0.2 : 0.8}>
        <WaveformBars reduced={reduced} />
      </Float>
      <Sparkles count={80} scale={[12, 6, 4]} size={2} speed={reduced ? 0.05 : 0.3} color={LIME} opacity={0.5} />
    </>
  )
}

export function WaveformScene() {
  return (
    <Canvas
      flat
      camera={{ position: [0, 0.6, 7], fov: 45 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
      fallback={<div className="w-full h-full bg-gradient-to-b from-lime/10 via-background to-background" />}
    >
      <Scene />
    </Canvas>
  )
}
