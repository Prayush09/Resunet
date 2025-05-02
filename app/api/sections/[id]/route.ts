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
    const { type, content, customName } = await req.json()

    // Check if section exists and belongs to user's resume
    const section = await db.section.findUnique({
      where: {
        id,
      },
      include: {
        resume: true,
      },
    })

    if (!section || section.resume.userId !== session.user.id) {
      return NextResponse.json({ error: "Section not found" }, { status: 404 })
    }

    // Update section
    const updatedSection = await db.section.update({
      where: {
        id,
      },
      data: {
        type,
        content,
        customName,
      },
    })

    return NextResponse.json(updatedSection)
  } catch (error) {
    console.error("Error in update section route:", error)
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

    // Check if section exists and belongs to user's resume
    const section = await db.section.findUnique({
      where: {
        id,
      },
      include: {
        resume: true,
      },
    })

    if (!section || section.resume.userId !== session.user.id) {
      return NextResponse.json({ error: "Section not found" }, { status: 404 })
    }

    // Delete section
    await db.section.delete({
      where: {
        id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in delete section route:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
