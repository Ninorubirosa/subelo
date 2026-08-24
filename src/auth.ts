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
      sendVerificationRequest: async ({ identifier, url }) => {
        await sendMagicLinkEmail({ to: identifier, url })
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user?.id) {
        token.artistId = (await createArtistForUser(db, user.id)).id
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
