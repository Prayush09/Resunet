import { getServerSession } from "next-auth"
import { redirect, notFound } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { DashboardHeader } from "@/components/dashboard-header"
import { ResumeEditor } from "@/components/resume-editor"

interface ResumeEditPageProps {
  params: {
    id: string
  }
}

export default async function ResumeEditPage({ params }: ResumeEditPageProps) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  const resume = await db.resume.findUnique({
    where: {
      id: params.id,
      userId: session.user.id,
    },
    include: {
      sections: {
        orderBy: {
          order: "asc",
        },
      },
      skills: true,
    },
  })

  if (!resume) {
    notFound()
  }

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />
      <main className="flex-1 flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 py-10">
        <div className="w-full max-w-3xl">
          <ResumeEditor resume={resume} />
        </div>
      </main>
    </div>
  )
}
