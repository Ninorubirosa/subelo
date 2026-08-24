import Link from 'next/link'

export default function LoginErrorPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-background text-foreground px-4">
      <div className="max-w-sm text-center">
        <h1 className="text-2xl font-bold mb-2">Link expired</h1>
        <p className="text-muted-foreground mb-6">
          That sign-in link is no longer valid. Request a new one below.
        </p>
        <Link href="/login" className="text-lime underline">
          Back to sign in
        </Link>
      </div>
    </main>
  )
}
