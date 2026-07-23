import NextAuth from "next-auth";
import { authConfig } from "./auth.config";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";
import { db } from "@/lib/db";
import { DYNAMIC_USERS } from "@/lib/services";
import bcrypt from "bcryptjs";

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
          console.error("Auth database query failed, using dynamic fallbacks:", error);
        }

        // Check dynamic user registry (mock accounts & newly registered accounts)
        const memUser = DYNAMIC_USERS.find(
          (u) => u.email.toLowerCase() === email.toLowerCase()
        );
        if (memUser) {
          const passwordsMatch = await bcrypt.compare(password, memUser.passwordHash);
          if (passwordsMatch) {
            return {
              id: memUser.id,
              name: memUser.name,
              email: memUser.email,
              role: memUser.role,
            };
          }
        }

        return null;
      },
    }),
  ],
});
