import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({
        authenticated: false,
        message: "No active session found",
      })
    }

    // Get user details
    const user = await db.user.findUnique({
      where: {
        id: session.user.id,
      },
      include: {
        accounts: true,
      },
    })

    // Remove sensitive information
    const safeUser = user
      ? {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          accounts: user.accounts.map((acc) => ({
            id: acc.id,
            provider: acc.provider,
            type: acc.type,
            providerAccountId: acc.providerAccountId,
          })),
        }
      : null

    return NextResponse.json({
      authenticated: true,
      session,
      user: safeUser,
    })
  } catch (error) {
    console.error("Error in auth debug route:", error)
    return NextResponse.json(
      {
        error: "Failed to retrieve auth debug information",
      },
      { status: 500 },
    )
  }
}
