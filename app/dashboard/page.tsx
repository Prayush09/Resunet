import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Plus } from "lucide-react"

import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { DashboardHeader } from "@/components/dashboard-header"
import { ResumeList } from "@/components/resume-list"
import { Button } from "@/components/ui/button"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  
  if (!session || !session.user?.id) {
    redirect("/login")
  }
  
  try {
    const resumes = await db.resume.findMany({
      where: { userId: session.user.id },
      orderBy: { updatedAt: "desc" },
    })
    
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <DashboardHeader />
        
        <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-8 md:py-12">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Your Resumes</h1>
            <Link href="/resume/new">
              <Button className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Create New Resume
              </Button>
            </Link>
          </div>
          
          {resumes.length > 0 ? (
            <div className="w-full">
              <ResumeList resumes={resumes} />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 md:py-20 text-center">
              <div className="max-w-md space-y-4">
                <h2 className="text-xl font-medium">You don&apos;t have any resumes yet</h2>
                <p className="text-muted-foreground">
                  Create your first resume to get started. You can choose from our templates and customize it to fit your needs.
                </p>
                <Link href="/resume/new">
                  <Button size="lg" className="mt-4">
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Resume
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </main>
      </div>
    )
  } catch (error) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <DashboardHeader />
        
        <main className="flex-1 w-full max-w-6xl mx-auto px-4 py-8 md:py-12">
          <div className="flex flex-col items-center justify-center py-12 md:py-20 text-center">
            <div className="max-w-md space-y-4">
              <h2 className="text-xl font-medium">Error loading resumes</h2>
              <p className="text-muted-foreground">
                There was an error loading your resumes. Please try again later.
              </p>
            </div>
          </div>
        </main>
      </div>
    )
  }
}