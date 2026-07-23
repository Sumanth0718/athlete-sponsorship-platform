import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

// Force NextAuth to trust the host and use the public Render URL
// to avoid "UntrustedHost" and "localhost:10000" callback URL bugs on Render.
process.env.AUTH_TRUST_HOST = "true";
if (!process.env.AUTH_URL) {
  process.env.AUTH_URL = "https://athlete-sponsorship-platform.onrender.com";
}
if (!process.env.AUTH_SECRET) {
  process.env.AUTH_SECRET = "e9a26372332cfae8bf691456d953926fef09dbf0a719bd99b9cf9bcfd964f434";
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

        if (!parsedCredentials.success) {
          return null;
        }

        const { email, password } = parsedCredentials.data;

        try {
          // Attempt to find user in DB
          const user = await db.user.findUnique({
            where: { email },
          });

          if (user) {
            const passwordsMatch = await bcrypt.compare(password, user.passwordHash);
            if (passwordsMatch) {
              return {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
              };
            }
          }
        } catch (error) {
          console.error("Auth database query failed:", error);
        }

        return null;
      },
    }),
  ],
});
