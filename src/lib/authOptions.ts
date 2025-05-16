import { PrismaAdapter } from "@next-auth/prisma-adapter";
import prisma from "@/lib/prisma";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import { NextAuthOptions, User as NextAuthUserFromLib } from "next-auth";

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
    strategy: "jwt" as const,
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
        // Ensure session.user is defined before assigning to its properties
        if (!session.user) {
          session.user = {} as any; // Or a more specific default user structure
        }
        session.user.id = token.id as string; // Cast token.id to string if necessary
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  secret: process.env.NEXTAUTH_SECRET,
};

// Minor change to trigger new commit 