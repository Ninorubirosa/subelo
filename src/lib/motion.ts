'use client'

import { useReducedMotion } from 'framer-motion'

/** Reduced-motion-aware fade+rise variants shared by every landing section reveal. */
export function useFadeInUp(y: number = 20) {
  const reduced = useReducedMotion()
  return {
    hidden: { opacity: 0, y: reduced ? 0 : y },
    shown: { opacity: 1, y: 0 },
  }
}
