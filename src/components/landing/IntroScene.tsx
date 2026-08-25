'use client'

import { useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Sparkles } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'

const BAR_COUNT = 48
const BLUE = '#38B6FF'
const RADIUS = 1.9
const ASSEMBLE_DURATION = 1.3
const SHOCKWAVE_DURATION = 0.7

function easeOutQuint(t: number) {
  return 1 - Math.pow(1 - t, 5)
}

function RadialBars() {
  const groupRef = useRef<THREE.Group>(null)
  const bars = useMemo(
    () =>
      Array.from({ length: BAR_COUNT }, (_, i) => {
        const angle = (i / BAR_COUNT) * Math.PI * 2
        const targetHeight = 0.5 + Math.abs(Math.sin(i * 0.7)) * 0.9
        const start = new THREE.Vector3(
          (Math.random() - 0.5) * 16,
          (Math.random() - 0.5) * 10,
          (Math.random() - 0.5) * 10 - 2
        )
        const target = new THREE.Vector3(Math.cos(angle) * RADIUS, Math.sin(angle) * RADIUS, 0)
        return { start, target, targetHeight, angle, delay: (i / BAR_COUNT) * 0.5 + Math.random() * 0.15 }
      }),
    []
  )

  useFrame((state) => {
    if (!groupRef.current) return
    const t = state.clock.getElapsedTime()
    groupRef.current.children.forEach((mesh, i) => {
      const b = bars[i]
      const localT = Math.min(1, Math.max(0, (t - b.delay) / (ASSEMBLE_DURATION - b.delay)))
      const eased = easeOutQuint(localT)
      mesh.position.lerpVectors(b.start, b.target, eased)
      mesh.rotation.z = b.angle + Math.PI / 2
      const settledPulse = t > ASSEMBLE_DURATION ? 1 + Math.sin(t * 2.2 + b.angle * 3) * 0.08 : 1
      mesh.scale.y = (0.1 + (b.targetHeight - 0.1) * eased) * settledPulse
    })
    groupRef.current.rotation.z = t > ASSEMBLE_DURATION ? (t - ASSEMBLE_DURATION) * 0.06 : 0
  })

  return (
    <group ref={groupRef}>
      {bars.map((_, i) => (
        <mesh key={i}>
          <boxGeometry args={[0.085, 1, 0.085]} />
          <meshStandardMaterial color={BLUE} emissive={BLUE} emissiveIntensity={1.4} toneMapped={false} />
        </mesh>
      ))}
    </group>
  )
}

function Shockwave() {
  const ref = useRef<THREE.Mesh>(null)

  useFrame((state) => {
    if (!ref.current) return
    const t = state.clock.getElapsedTime() - ASSEMBLE_DURATION
    const progress = Math.min(1, Math.max(0, t / SHOCKWAVE_DURATION))
    const visible = t > 0 && progress < 1
    ref.current.visible = visible
    if (!visible) return
    const scale = 0.3 + easeOutQuint(progress) * 5
    ref.current.scale.setScalar(scale)
    const material = ref.current.material as THREE.MeshBasicMaterial
    material.opacity = (1 - progress) * 0.6
  })

  return (
    <mesh ref={ref} rotation={[0, 0, 0]} visible={false}>
      <ringGeometry args={[0.96, 1, 64]} />
      <meshBasicMaterial color={BLUE} transparent opacity={0} toneMapped={false} side={THREE.DoubleSide} />
    </mesh>
  )
}

function CameraRig() {
  const { camera } = useThree()
  const start = useRef(new THREE.Vector3(0.6, -0.3, 9.5))
  const end = useRef(new THREE.Vector3(0, 0.2, 6.4))

  useFrame((state) => {
    const t = Math.min(1, state.clock.getElapsedTime() / ASSEMBLE_DURATION)
    camera.position.lerpVectors(start.current, end.current, easeOutQuint(t))
    camera.lookAt(0, 0, 0)
  })

  return null
}

export function IntroScene({ reduced }: { reduced: boolean }) {
  if (reduced) {
    return <div className="w-full h-full bg-background" />
  }

  return (
    <Canvas
      flat
      camera={{ position: [0, 0.2, 6.4], fov: 45 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: true }}
      fallback={<div className="w-full h-full bg-background" />}
    >
      <ambientLight intensity={0.06} />
      <pointLight position={[0, 0, 4]} intensity={6} color={BLUE} />
      <CameraRig />
      <RadialBars />
      <Shockwave />
      <Sparkles count={100} scale={[14, 8, 6]} size={2} speed={0.25} color={BLUE} opacity={0.45} />
      <EffectComposer>
        <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} intensity={1.5} mipmapBlur radius={0.6} />
      </EffectComposer>
    </Canvas>
  )
}
