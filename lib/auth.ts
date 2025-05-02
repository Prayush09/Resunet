import { PrismaAdapter } from "@next-auth/prisma-adapter"
import type { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"

import { db } from "@/lib/db"

// Get the base URL from environment or use the production URL
const baseUrl = process.env.NEXTAUTH_URL || "https://resunest.prayushgiri.com"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  session: {
    strategy: "jwt",
    maxAge: 12 * 60 * 60, // 12 hours of login session
  },
  pages: {
    signIn: "/login",
    error: "/login", // Error code passed in query string as ?error=
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development", // Enable debug mode in development
  providers: [
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
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await db.user.findUnique({
          where: {
            email: credentials.email,
          },
        })

        if (!user || !user.password) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Only process OAuth sign-ins
      if (account?.provider === "google" && profile?.email) {
        try {
          console.log("Google profile:", profile)

          // Check if user exists with this email
          const existingUser = await db.user.findUnique({
            where: { email: profile.email },
            include: { accounts: true },
          })

          if (!existingUser) {
            // Create new user if they don't exist yet
            const newUser = await db.user.create({
              data: {
                email: profile.email,
                name: profile.name || "Google User",
                //@ts-ignore
                image: profile.picture || profile.image, // Save the profile image
                accounts: {
                  create: {
                    type: account.type,
                    provider: account.provider,
                    providerAccountId: account.providerAccountId,
                    access_token: account.access_token,
                    expires_at: account.expires_at,
                    token_type: account.token_type,
                    scope: account.scope,
                    id_token: account.id_token,
                    session_state: account.session_state,
                  },
                },
              },
              include: {
                accounts: true,
              },
            })

            console.log("Created new user with Google account:", newUser.email)
            return true
          } else {
            // Check if this Google account is already linked
            const linkedGoogleAccount = existingUser.accounts.find(
              (acc) => acc.provider === "google" && acc.providerAccountId === account.providerAccountId,
            )

            // Always update the user's profile with the latest Google info
            await db.user.update({
              where: { id: existingUser.id },
              data: {
                name: profile.name || existingUser.name,
                //@ts-ignore
                image: profile.picture || profile.image || existingUser.image,
              },
            })

            console.log("Updated user profile with Google info:", {
              name: profile.name,
              //@ts-ignore
              image: profile.picture || profile.image,
            })

            if (!linkedGoogleAccount) {
              // Link the Google account to the existing user
              console.log("Linking Google account to existing user:", existingUser.email)

              try {
                await db.account.create({
                  data: {
                    userId: existingUser.id,
                    type: account.type,
                    provider: account.provider,
                    providerAccountId: account.providerAccountId,
                    access_token: account.access_token,
                    expires_at: account.expires_at,
                    token_type: account.token_type,
                    scope: account.scope,
                    id_token: account.id_token,
                    session_state: account.session_state,
                  },
                })
              } catch (error) {
                console.error("Error linking Google account:", error)
                // If there's an error linking the account, we still want to allow sign-in
                // This could happen if the account is already linked to another user
                // In that case, we'll just continue with the sign-in
              }
            } else {
              console.log("Google account already linked to user:", existingUser.email)
            }

            return true
          }
        } catch (error) {
          console.error("Error in Google sign-in flow:", error)
          return false
        }
      }

      return true
    },
    async redirect({ url, baseUrl }) {
      // Use our defined baseUrl instead of the parameter
      const productionBaseUrl = process.env.NEXTAUTH_URL || "https://resunest.prayushgiri.com"

      // Allows relative callback URLs
      if (url.startsWith("/")) return `${productionBaseUrl}${url}`
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === productionBaseUrl) return url
      return productionBaseUrl
    },
    async session({ token, session }) {
      console.log("Session callback called with token:", token)

      if (token) {
        session.user.id = token.id as string
        session.user.name = token.name as string
        session.user.email = token.email as string
        session.user.image = token.picture as string
      }

      console.log("Returning session:", session)
      return session
    },
    async jwt({ token, user, account, profile }) {
      console.log("JWT callback called with:", {
        tokenSub: token.sub,
        userId: user?.id,
        accountProvider: account?.provider,
      })

      // Initial sign in
      if (account && user) {
        console.log("Initial sign in, setting token from user:", user)
        return {
          ...token,
          id: user.id,
          name: user.name,
          email: user.email,
          picture: user.image,
        }
      }

      // Return previous token if the user hasn't changed
      const dbUser = await db.user.findFirst({
        where: {
          email: token.email as string,
        },
      })

      if (!dbUser) {
        console.log("No user found in database for token:", token)
        if (token.sub) {
          // Try to find by sub if email lookup fails
          const userBySub = await db.user.findFirst({
            where: {
              id: token.sub,
            },
          })

          if (userBySub) {
            console.log("Found user by sub:", userBySub)
            return {
              ...token,
              id: userBySub.id,
              name: userBySub.name,
              email: userBySub.email,
              picture: userBySub.image,
            }
          }
        }

        console.log("Using token as is:", token)
        return token
      }

      console.log("Found user in database:", dbUser)
      return {
        ...token,
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        picture: dbUser.image,
      }
    },
  },
  events: {
    async signIn(message) {
      console.log("Successful sign-in event:", message)
    },
    async signOut(message) {
      console.log("Sign-out event:", message)
    },
    async createUser(message) {
      console.log("Create user event:", message)
    },
    async linkAccount(message) {
      console.log("Link account event:", message)
    },
    //@ts-ignore
    async error(message) {
      console.error("Auth error event:", message)
    },
  },
}
