import NextAuth from 'next-auth'
import { AuthOptions } from 'next-auth'

const authOptions: AuthOptions = {
  providers: [
    {
      id: 'bluesky',
      name: 'Bluesky',
      type: 'oauth',
      version: '2.0',
      client: {
        id: process.env.BLUESKY_CLIENT_ID || 'etcetera-exchange',
        client_secret: process.env.BLUESKY_CLIENT_SECRET || '',
      },
      wellKnown: 'https://bsky.social/.well-known/oauth_authorization_server',
      authorization: { params: { scope: 'atproto transition:generic' } },
      checks: ['pkce', 'state'],
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.preferred_username || profile.name,
          email: profile.email,
          image: profile.picture,
        }
      },
    },
  ],
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async session({ session, token }) {
      return session
    },
    async jwt({ token, account, profile }) {
      return token
    },
  },
  secret: process.env.NEXTAUTH_SECRET || 'your-secret-key-here',
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
