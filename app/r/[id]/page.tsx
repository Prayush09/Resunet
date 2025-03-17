import { notFound } from "next/navigation"
import { db } from "@/lib/db"
import { ResumeView } from "@/components/resume-view"

interface ResumeViewPageProps {
  params: {
    id: string
  }
}

export default async function ResumeViewPage({ params }: ResumeViewPageProps) {
  const resume = await db.resume.findUnique({
    where: {
      id: params.id,
    },
    include: {
      user: {
        select: {
          name: true,
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
    notFound()
  }

  return <ResumeView resume={resume} />
}

