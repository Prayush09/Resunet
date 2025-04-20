import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"

import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get user with Google Scholar settings
    const user = await db.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        googleScholarUrl: true,
        patentsToDisplay: true,
      },
    })

    // Get patents for this user
    const patents = await db.patent.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: [
        { citations: 'desc' },
        { publicationDate: 'desc' },
      ],
    })

    return NextResponse.json({
      patents,
      googleScholarUrl: user?.googleScholarUrl,
      patentsToDisplay: user?.patentsToDisplay || 3,
    })
  } catch (error) {
    console.error("Error in get patents route:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}
