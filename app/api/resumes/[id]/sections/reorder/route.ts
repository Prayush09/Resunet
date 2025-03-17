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
    const { sections } = await req.json()

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

    // Update section orders
    const updates = sections.map((section: { id: string; order: number }) =>
      db.section.update({
        where: {
          id: section.id,
        },
        data: {
          order: section.order,
        },
      }),
    )

    await Promise.all(updates)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in reorder sections route:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

