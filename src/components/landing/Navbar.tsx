'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { Session } from 'next-auth'
import { signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { useFadeInUp } from '@/lib/motion'

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'Dashboard', href: '#dashboard' },
]

export function Navbar({ session }: { session: Session | null }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const fade = useFadeInUp(-20)
  const isAuthed = !!session?.user

  return (
    <motion.nav
      initial="hidden"
      animate="shown"
      variants={fade}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2 group">
            <Image src="/logo-mark.png" alt="" width={243} height={125} className="h-7 w-auto" priority />
            <span className="text-xl font-bold tracking-tight">
              SUB<span className="text-lime">ELO</span>
            </span>
          </a>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthed ? (
              <>
                <Button
                  variant="ghost"
                  className="text-muted-foreground hover:text-foreground"
                  onClick={() => signOut({ callbackUrl: '/' })}
                >
                  Sign out
                </Button>
                <Button asChild className="bg-lime text-black hover:bg-lime-dark font-semibold glow-button">
                  <Link href="/dashboard">Dashboard</Link>
                </Button>
              </>
            ) : (
              <>
                <Button asChild variant="ghost" className="text-muted-foreground hover:text-foreground">
                  <Link href="/login">Log in</Link>
                </Button>
                <Button asChild className="bg-lime text-black hover:bg-lime-dark font-semibold glow-button">
                  <Link href="/login">Start Free</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-foreground"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden bg-surface border-t border-border"
          >
            <div className="px-4 py-4 flex flex-col gap-3">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="text-sm text-muted-foreground hover:text-foreground py-2 transition-colors"
                >
                  {link.label}
                </a>
              ))}
              <div className="flex flex-col gap-2 pt-3 border-t border-border">
                {isAuthed ? (
                  <>
                    <Button
                      variant="ghost"
                      className="w-full justify-center text-muted-foreground"
                      onClick={() => signOut({ callbackUrl: '/' })}
                    >
                      Sign out
                    </Button>
                    <Button asChild className="w-full bg-lime text-black hover:bg-lime-dark font-semibold">
                      <Link href="/dashboard" onClick={() => setMobileOpen(false)}>
                        Dashboard
                      </Link>
                    </Button>
                  </>
                ) : (
                  <>
                    <Button asChild variant="ghost" className="w-full justify-center text-muted-foreground">
                      <Link href="/login" onClick={() => setMobileOpen(false)}>
                        Log in
                      </Link>
                    </Button>
                    <Button asChild className="w-full bg-lime text-black hover:bg-lime-dark font-semibold">
                      <Link href="/login" onClick={() => setMobileOpen(false)}>
                        Start Free
                      </Link>
                    </Button>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}