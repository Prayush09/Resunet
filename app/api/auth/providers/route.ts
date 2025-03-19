import { NextResponse } from "next/server"

export async function GET() {
  try {
    // Instead of using getProviders() from client, we'll construct the providers info manually
    const providers = {
      google: {
        id: "google",
        name: "Google",
        type: "oauth",
        signinUrl: "/api/auth/signin/google",
        callbackUrl: "/api/auth/callback/google",
      },
      credentials: {
        id: "credentials",
        name: "Credentials",
        type: "credentials",
        signinUrl: "/api/auth/signin/credentials",
        callbackUrl: "/api/auth/callback/credentials",
      },
    }

    return NextResponse.json(providers)
  } catch (error) {
    console.error("Error in providers route:", error)
    return NextResponse.json({ error: "Failed to get providers" }, { status: 500 })
  }
}

