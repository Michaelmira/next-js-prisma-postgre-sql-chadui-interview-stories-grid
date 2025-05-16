import NextAuth from "next-auth";
// Session, NextAuthUserFromLib, JWT, AdapterUser removed as they are unused

import { authOptions } from "@/lib/authOptions";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }; 