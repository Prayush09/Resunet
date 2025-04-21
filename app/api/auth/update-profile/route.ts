import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

// Increase JSON body size limit for Base64 uploads
export const config = {
  api: {
    bodyParser: { sizeLimit: "10mb" },
  },
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    console.log("API route session data:", JSON.stringify(session, null, 2))

    if (!session || !session.user) {
      return NextResponse.json(
        {
          error: "Unauthorized",
          sessionData: session ? "Session exists but no user" : "No session found",
        },
        { status: 401 },
      )
    }

    const payload = await req.json()

    // Determine which image source to use
    let imageSource: string | null = null

    // If we have a direct URL, use that
    if (payload.imageUrl) {
      imageSource = payload.imageUrl
      console.log("Using direct image URL")
    }
    // Otherwise use base64 data if available
    else if (payload.imageBase64) {
      imageSource = payload.imageBase64
      console.log("Using base64 image data")
    }

    if (!imageSource) {
      return NextResponse.json({ error: "No image data provided" }, { status: 400 })
    }

    // Extract user ID safely
    const userId = session.user.id || (session.user as any).sub || (session as any).sub
    if (!userId) {
      console.error("Could not extract user ID from session:", session)
      return NextResponse.json({ error: "User ID not found in session" }, { status: 400 })
    }

    console.log("Updating profile image for user ID:", userId)

    const updatedUser = await db.user.update({
      where: { id: userId },
      data: { image: imageSource },
      select: { id: true, name: true, email: true, image: true },
    })

    console.log("Profile image updated successfully for user:", updatedUser.id)

    return NextResponse.json({
      success: true,
      user: updatedUser,
    })
  } catch (error) {
    console.error("Error in /api/auth/update-profile:", error)
    return NextResponse.json({ error: "Failed to update profile image" }, { status: 500 })
  }
}
