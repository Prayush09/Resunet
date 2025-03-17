import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params
    const { title, summary } = await req.json()

    // Check if resume exists and belongs to user
    const resume = await db.resume.findUnique({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 })
    }

    // Update resume
    const updatedResume = await db.resume.update({
      where: {
        id,
      },
      data: {
        title,
        summary,
      },
    })

    return NextResponse.json(updatedResume)
  } catch (error) {
    console.error("Error in update resume route:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params

    // Check if resume exists and belongs to user
    const resume = await db.resume.findUnique({
      where: {
        id,
        userId: session.user.id,
      },
    })

    if (!resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 })
    }

    // Delete resume
    await db.resume.delete({
      where: {
        id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in delete resume route:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

