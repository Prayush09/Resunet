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
    const { name, proficiency } = await req.json()

    // Check if skill exists and belongs to user's resume
    const skill = await db.skill.findUnique({
      where: {
        id,
      },
      include: {
        resume: true,
      },
    })

    if (!skill || skill.resume.userId !== session.user.id) {
      return NextResponse.json({ error: "Skill not found" }, { status: 404 })
    }

    // Update skill
    const updatedSkill = await db.skill.update({
      where: {
        id,
      },
      data: {
        name,
        proficiency,
      },
    })

    return NextResponse.json(updatedSkill)
  } catch (error) {
    console.error("Error in update skill route:", error)
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

    // Check if skill exists and belongs to user's resume
    const skill = await db.skill.findUnique({
      where: {
        id,
      },
      include: {
        resume: true,
      },
    })

    if (!skill || skill.resume.userId !== session.user.id) {
      return NextResponse.json({ error: "Skill not found" }, { status: 404 })
    }

    // Delete skill
    await db.skill.delete({
      where: {
        id,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in delete skill route:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

