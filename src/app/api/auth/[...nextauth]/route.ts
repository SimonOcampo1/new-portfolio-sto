import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

const handler = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      // Admin whitelist check
      const isAdmin = user.email === "ocamposimon1@gmail.com";
      if (isAdmin) {
        return true;
      }
      return false; // Deny access to non-admins
    },
    async session({ session, user }) {
      if (session.user && user.email === "ocamposimon1@gmail.com") {
        (session.user as any).role = "admin";
      }
      return session;
    },
  },
});

export { handler as GET, handler as POST };
