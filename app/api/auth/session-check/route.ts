import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    return NextResponse.json({
      authenticated: !!session,
      session: session,
      user: session?.user || null,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Error in session check route:", error)
    return NextResponse.json(
      {
        error: "Failed to check session",
        errorMessage: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
