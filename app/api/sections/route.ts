import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { resumeId, type, content, order } = await req.json()

    if (!resumeId || !type || !content) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if resume exists and belongs to user
    const resume = await db.resume.findUnique({
      where: {
        id: resumeId,
        userId: session.user.id,
      },
    })

    if (!resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 })
    }

    // Create section
    const section = await db.section.create({
      data: {
        resumeId,
        type,
        content,
        order: order || 0,
      },
    })

    return NextResponse.json(section, { status: 201 })
  } catch (error) {
    console.error("Error in create section route:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

