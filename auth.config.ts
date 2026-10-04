// auth.config.ts
// Edge-compatible NextAuth configuration for Middleware
import type { NextAuthConfig } from 'next-auth';

export const authConfig = {
  pages: {
    signIn: '/login',
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const { pathname } = nextUrl;

      const isPublic =
        pathname.startsWith('/_next') ||
        pathname.startsWith('/favicon.ico') ||
        pathname.startsWith('/api/auth');

      if (isPublic) return true;

      // Handle root '/' path
      if (pathname === '/') {
        if (isLoggedIn) return Response.redirect(new URL('/dashboard', nextUrl));
        return Response.redirect(new URL('/login', nextUrl));
      }

      // Handle login page access when already authenticated
      if (pathname === '/login') {
        if (isLoggedIn) return Response.redirect(new URL('/dashboard', nextUrl));
        return true;
      }

      return isLoggedIn;
    },
    jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role ?? 'manager';
      }
      return token;
    },
    session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  providers: [], // Providers array empty here; added in auth.ts for Node.js runtime
} satisfies NextAuthConfig;
