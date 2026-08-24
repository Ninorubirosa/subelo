'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { Button } from '@/components/ui/button'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('sending')
    try {
      const result = await signIn('resend', { email, redirect: false })
      setStatus(result?.error ? 'error' : 'sent')
    } catch (error) {
      console.error('Sign in error:', error)
      setStatus('error')
    }
  }

  if (status === 'sent') {
    return (
      <main className="min-h-screen flex items-center justify-center bg-background text-foreground px-4">
        <div className="max-w-sm text-center">
          <h1 className="text-2xl font-bold mb-2">Check your inbox</h1>
          <p className="text-muted-foreground">
            We sent a sign-in link to {email}. It expires in 24 hours.
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-background text-foreground px-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-6 text-center">Sign in to Subelo</h1>
        <input
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full rounded-md border border-border bg-surface px-4 py-2 mb-3 text-sm"
        />
        <Button type="submit" className="w-full" disabled={status === 'sending'}>
          {status === 'sending' ? 'Sending…' : 'Send me a link'}
        </Button>
        {status === 'error' && (
          <p className="mt-3 text-sm text-destructive">
            Something went wrong sending your link. Please try again.
          </p>
        )}
      </form>
    </main>
  )
}
