import { PrismaAdapter } from "@next-auth/prisma-adapter";
import type { NextAuthOptions, DefaultSession } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

import { db } from "@/lib/db";

declare module "next-auth" {
  interface Session extends DefaultSession {
    accessToken: string;
    refreshToken: string;
    user: {
      id: string;
      email: string;
      name: string;
      image?: string | null; // Allow null value
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    accessToken: string;
    refreshToken: string;
    name: string;
    email: string;
    picture?: string | null; // Allow null value
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development", // Enable debug mode in development
  providers: [
    // Google Provider
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
        },
      },
    }),

    // Credentials Provider (Email + Password)
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials): Promise<any> {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and Password are required");
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          throw new Error("Invalid credentials");
        }

        const isValid = await bcrypt.compare(credentials.password, user.password);
        if (!isValid) throw new Error("Invalid password");

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image || null,
        };
      },
    }),
  ],
  callbacks: {
    // Handle JWT creation and storage
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.email = user.email as string;
        token.name = user.name as string;
        token.picture = user.image || null; // Handle null values properly
      }

      // If signing in with OAuth (Google)
      if (account) {
        token.accessToken = account.access_token as string;
        token.refreshToken = account.refresh_token as string;
      }

      // Fetch user from database and attach to token
      if (!token.email) return token;

      const dbUser = await db.user.findUnique({
        where: { email: token.email },
      });

      if (dbUser) {
        token.id = dbUser.id;
        token.name = dbUser.name;
        token.email = dbUser.email;
        token.picture = dbUser.image || null;
      }

      return token;
    },

    // Attach token data to session
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.image = token.picture || null;
        session.accessToken = token.accessToken;
        session.refreshToken = token.refreshToken;
      }

      return session;
    },

    // Handle sign-in behavior
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        const existingUser = await db.user.findUnique({
          where: { email: user.email! },
        });

        await db.account.upsert({
          where: {
            provider_providerAccountId: {
              provider: account.provider,
              providerAccountId: account.providerAccountId,
            },
          },
          create: {
            userId: existingUser
              ? existingUser.id
              : (
                  await db.user.create({
                    data: {
                      email: user.email!,
                      name: user.name || "Google User",
                      image: user.image || null,
                    },
                  })
                ).id,
            type: account.type,
            provider: account.provider,
            providerAccountId: account.providerAccountId,
            access_token: account.access_token,
            refresh_token: account.refresh_token,
            expires_at: account.expires_at,
            id_token: account.id_token,
            scope: account.scope,
            token_type: account.token_type,
          },
          update: {
            access_token: account.access_token,
            refresh_token: account.refresh_token,
            expires_at: account.expires_at,
            id_token: account.id_token,
            scope: account.scope,
            token_type: account.token_type,
          },
        });

        console.log("✅ Linked Google account to existing user");
      }

      return true;
    },
  },
  events: {
    async signIn({ user }) {
      console.log(`✅ Sign-in: ${user.email}`);
    },
    async signOut({ session }) {
      console.log(`✅ Sign-out: ${session.user?.email}`);
    },
  },
};
