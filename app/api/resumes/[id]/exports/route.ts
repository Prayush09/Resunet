import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = params
    const { searchParams } = new URL(req.url)
    const format = searchParams.get("format") || "json"

    // Get user to fetch patentsToDisplay setting
    const user = await db.user.findUnique({
      where: {
        id: session.user.id,
      },
      select: {
        patentsToDisplay: true,
      },
    })

    // Get resume with all related data
    const resume = await db.resume.findUnique({
      where: {
        id,
        userId: session.user.id,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            image: true,
          },
        },
        sections: {
          orderBy: {
            order: "asc",
          },
        },
        skills: {
          orderBy: {
            proficiency: "desc",
          },
        },
      },
    })

    if (!resume) {
      return NextResponse.json({ error: "Resume not found" }, { status: 404 })
    }

    // Get patents separately to apply the user's patentsToDisplay setting
    const patents = await db.patent.findMany({
      where: {
        userId: session.user.id,
      },
      take: user?.patentsToDisplay || 3,
      orderBy: [{ citations: "desc" }, { publicationDate: "desc" }],
    })

    // Add patents to the resume object
    const resumeWithPatents = {
      ...resume,
      patents,
    }

    // Handle different export formats
    switch (format) {
      case "json":
        return NextResponse.json(resumeWithPatents)

      case "markdown":
        const markdown = generateMarkdown(resumeWithPatents)
        return new NextResponse(markdown, {
          headers: {
            "Content-Type": "text/markdown",
            "Content-Disposition": `attachment; filename="${resume.title.replace(/\s+/g, "-").toLowerCase()}.md"`,
          },
        })

      case "pdf":
        // For PDF, we'll return a URL that the client can use to download the PDF
        // The actual PDF generation will happen on the client side
        return NextResponse.json({
          success: true,
          message: "Use client-side PDF generation",
        })

      default:
        return NextResponse.json({ error: "Unsupported export format" }, { status: 400 })
    }
  } catch (error) {
    console.error("Error in export resume route:", error)
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}

function generateMarkdown(resume: any): string {
  let markdown = `# ${resume.title}\n\n`

  // Add user info
  if (resume.user?.name) {
    markdown += `**${resume.user.name}**\n`
  }
  if (resume.user?.email) {
    markdown += `${resume.user.email}\n`
  }
  markdown += "\n"

  // Add summary
  if (resume.summary) {
    markdown += `## Summary\n\n${resume.summary}\n\n`
  }

  // Add sections
  for (const section of resume.sections) {
    const sectionTitle =
      section.type === "EDUCATION"
        ? "Education"
        : section.type === "EXPERIENCE"
          ? "Experience"
          : section.type === "PROJECTS"
            ? "Projects"
            : section.type === "CERTIFICATIONS"
              ? "Certifications"
              : section.type === "SKILLS"
                ? "Skills"
                : "Custom"

    markdown += `## ${sectionTitle}\n\n${section.content}\n\n`
  }

  // Add skills
  if (resume.skills && resume.skills.length > 0) {
    markdown += `## Skills\n\n`
    for (const skill of resume.skills) {
      markdown += `- ${skill.name}: ${skill.proficiency}%\n`
    }
    markdown += "\n"
  }

  // Add patents
  if (resume.patents && resume.patents.length > 0) {
    markdown += `## Patents\n\n`
    for (const patent of resume.patents) {
      markdown += `### ${patent.title}\n`
      markdown += `**Authors:** ${patent.authors}\n`

      if (patent.patentNumber) {
        markdown += `**Patent Number:** ${patent.patentNumber}\n`
      }

      if (patent.publicationDate) {
        markdown += `**Published:** ${patent.publicationDate}\n`
      }

      if (patent.citations !== null) {
        markdown += `**Citations:** ${patent.citations}\n`
      }

      if (patent.abstract) {
        markdown += `\n${patent.abstract}\n`
      }

      if (patent.url) {
        markdown += `\n[View on Google Scholar](${patent.url})\n`
      }

      markdown += "\n"
    }
  }

  return markdown
}
