import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { DashboardHeader } from "@/components/dashboard-header"
import { ResumeList } from "@/components/resume-list"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  const resumes = await db.resume.findMany({
    where: {
      userId: session.user.id,
    },
    orderBy: {
      updatedAt: "desc",
    },
  })

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />
      <main className="flex-1 container py-10">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Your Resumes</h1>
          <Link href="/resume/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create New Resume
            </Button>
          </Link>
        </div>
        {resumes.length > 0 ? (
          <ResumeList resumes={resumes} />
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <h2 className="text-xl font-medium mb-4">You don&apos;t have any resumes yet</h2>
            <p className="text-muted-foreground mb-8 max-w-md">
              Create your first resume to get started. You can choose from our templates and customize it to fit your
              needs.
            </p>
            <Link href="/resume/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Resume
              </Button>
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}

