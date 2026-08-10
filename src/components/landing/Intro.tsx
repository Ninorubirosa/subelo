'use client'

import dynamic from 'next/dynamic'
import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'

const STORAGE_KEY = 'subelo-intro-seen'
const HOLD_UNTIL_MS = 1700
const FADE_MS = 600

const IntroScene = dynamic(() => import('./IntroScene').then((m) => m.IntroScene), { ssr: false })

export function Intro({ children }: { children: React.ReactNode }) {
  const [phase, setPhase] = useState<'pending' | 'playing' | 'done'>('pending')
  const [reduced, setReduced] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const alreadySeen = localStorage.getItem(STORAGE_KEY) === '1'

    if (alreadySeen || mq.matches) {
      setReduced(mq.matches)
      localStorage.setItem(STORAGE_KEY, '1')
      document.documentElement.setAttribute('data-intro-seen', '1')
      setPhase('done')
      return
    }

    setPhase('playing')
    const timer = setTimeout(finish, HOLD_UNTIL_MS)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function finish() {
    localStorage.setItem(STORAGE_KEY, '1')
    document.documentElement.setAttribute('data-intro-seen', '1')
    setPhase('done')
  }

  return (
    <>
      <AnimatePresence>
        {phase === 'playing' && (
          <motion.div
            className="intro-overlay fixed inset-0 z-[100] bg-background"
            exit={{ opacity: 0 }}
            transition={{ duration: FADE_MS / 1000, ease: 'easeOut' }}
          >
            <IntroScene reduced={reduced} />
            <button
              onClick={finish}
              className="absolute top-6 right-6 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Skip
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      {children}
    </>
  )
}
