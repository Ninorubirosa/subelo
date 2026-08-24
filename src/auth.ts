import NextAuth from 'next-auth'
import Resend from 'next-auth/providers/resend'
import { PrismaAdapter } from '@auth/prisma-adapter'
import { db } from '@/lib/db'
import { createArtistForUser } from '@/lib/create-artist-for-user'
import { sendMagicLinkEmail } from '@/lib/send-magic-link-email'

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: 'jwt' },
  pages: {
    error: '/login/error',
  },
  providers: [
    Resend({
      apiKey: process.env.AUTH_RESEND_KEY,
      from: 'Subelo <no-reply@subelodistro.com>',
      sendVerificationRequest: async ({ identifier, url }) => {
        await sendMagicLinkEmail({ to: identifier, url })
      },
    }),
  ],
  events: {
    createUser: async ({ user }) => {
      if (user.id) {
        await createArtistForUser(db, user.id)
      }
    },
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) {
        const artist = await db.artist.findUnique({ where: { userId: user.id } })
        if (artist) {
          token.artistId = artist.id
        }
      }
      return token
    },
    async session({ session, token }) {
      if (token.artistId) {
        session.user.artistId = token.artistId
      }
      return session
    },
  },
})
