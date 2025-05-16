import NextAuth, { User as NextAuthUserFromLib, Session, NextAuthOptions } from "next-auth";
import { AdapterUser } from "next-auth/adapters";
import { JWT } from "next-auth/jwt";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/prisma"; // We'll create this file next
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt"; // We'll need to install bcrypt

// Define a type for the user object returned by authorize
interface AuthorizeUser extends NextAuthUserFromLib {
    id: string;
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text", placeholder: "jsmith@example.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials): Promise<AuthorizeUser | null> {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }
        const userDb = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        if (!userDb || !userDb.hashedPassword) { return null; }
        const isValidPassword = await bcrypt.compare(
          credentials.password,
          userDb.hashedPassword
        );
        if (!isValidPassword) { return null; }
        return { id: userDb.id, email: userDb.email, name: userDb.email };
      },
    }),
  ],
  session: {
    strategy: "jwt" as const, // Correctly typed session strategy
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin", // We'll create this page later
    // error: '/auth/error', // (optional) Error code passed in query string as ?error=
    // newUser: '/auth/new-user' // New users will be directed here on first sign in (leave the property out if not of interest)
  },
  secret: process.env.NEXTAUTH_SECRET, // Add NEXTAUTH_SECRET to your .env file
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }; 