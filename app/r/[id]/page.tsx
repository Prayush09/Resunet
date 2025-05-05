import { notFound } from "next/navigation"
import { db } from "@/lib/db"
import { ResumeView } from "@/components/resume-view"
import { ThemeToggle } from "@/components/theme-toggle"

interface ResumeViewPageProps {
  params: {
    id: string
  }
}

export default async function ResumeViewPage({ params }: ResumeViewPageProps) {
  try {
    // First, get the resume to access the user
    const resumeBasic = await db.resume.findUnique({
      where: {
        id: params.id,
      },
      include: {
        user: {
          select: {
            id: true,
            patentsToDisplay: true,
            
          },
        },
      },
    })

    if (!resumeBasic) {
      notFound()
    }

    // Now get the full resume with all related data
    const resume = await db.resume.findUnique({
      where: {
        id: params.id,
      },
      include: {
        user: {
          select: {
            name: true,
            image: true,
            linkedin: true,
            twitter: true,
            email: true,
            mobile: true,
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
      notFound()
    }

    // Get patents separately to apply the user's patentsToDisplay setting
    const patents = await db.patent.findMany({
      where: {
        userId: resumeBasic.user.id,
      },
      take: resumeBasic.user.patentsToDisplay || 0,
      orderBy: [{ citations: "desc" }, { publicationDate: "desc" }],
    })

    // Add patents to the resume object
    const resumeWithPatents = {
      ...resume,
      patents,
    }

    return <>
      <div className="fixed bottom-4 right-4 z-50">
        <ThemeToggle />
      </div>
      <ResumeView resume={resumeWithPatents} />
      </>
  } catch (error) {
    console.error("Error fetching resume:", error)
    notFound()
  }
}
