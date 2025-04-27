import { NextResponse } from "next/server"
import { getServerSession } from "next-auth" 
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db" 

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const { name, twitter, linkedin, googleScholarUrl, patentsToDisplay } = await req.json()
    
    // Update user profile
    const updatedUser = await db.user.update({
      where: {
        id: session.user.id,
      },
      data: {
        name,
        twitter,
        linkedin,
        googleScholarUrl,
        patentsToDisplay,
      },
    })
    
    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("Error in update profile route:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}