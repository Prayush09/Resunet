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

    const { title, template } = await req.json()

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    // Create resume
    const resume = await db.resume.create({
      data: {
        title,
        userId: session.user.id,
        summary: `I'm a professional with experience in ${template || "various"} fields.`,
      },
    })

    // Add default sections based on template
    const sections = []

    if (template === "modern" || template === "classic") {
      sections.push(
        {
          resumeId: resume.id,
          type: "EXPERIENCE",
          content:
            "Company Name\nPosition Title\nJan 2020 - Present\n\n• Accomplishment 1\n• Accomplishment 2\n• Accomplishment 3",
          order: 0,
        },
        {
          resumeId: resume.id,
          type: "EDUCATION",
          content:
            "University Name\nDegree Name\n2016 - 2020\n\n• GPA: 3.8/4.0\n• Relevant Coursework: Course 1, Course 2",
          order: 1,
        },
      )
    }

    if (template === "creative") {
      sections.push(
        {
          resumeId: resume.id,
          type: "PROJECTS",
          content:
            "Project Name\nRole\nJan 2021 - Mar 2021\n\n• Description of the project\n• Technologies used\n• Outcome and impact",
          order: 0,
        },
        {
          resumeId: resume.id,
          type: "EXPERIENCE",
          content:
            "Company Name\nPosition Title\nJan 2020 - Present\n\n• Accomplishment 1\n• Accomplishment 2\n• Accomplishment 3",
          order: 1,
        },
      )
    }

    await db.section.createMany({
      //@ts-ignore
      data: sections, 
    })

    return NextResponse.json(resume, { status: 201 })
  } catch (error) {
    console.error("Error in create resume route:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

