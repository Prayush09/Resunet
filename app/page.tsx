import Link from "next/link"
import { Button } from "@/components/ui/button"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { ArrowRight, FileText, Share2, LayoutTemplateIcon as Template } from "lucide-react"

export default async function Home() {
  const session = await getServerSession(authOptions)

  if (session) {
    redirect("/dashboard")
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2 font-bold">
            <FileText className="h-5 w-5" />
            <span>Resume Builder</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login">
              <Button variant="ghost">Log in</Button>
            </Link>
            <Link href="/register">
              <Button>Sign up</Button>
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="py-20 md:py-32">
          <div className="container flex flex-col items-center text-center">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
              Create professional resumes in minutes
            </h1>
            <p className="mt-6 max-w-[700px] text-muted-foreground md:text-xl">
              Build, customize, and share your resume with our easy-to-use builder. Choose from professional templates
              and get hired faster.
            </p>
            <div className="mt-10">
              <Link href="/register">
                <Button size="lg" className="h-12 px-8">
                  Get started
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
        <section className="border-t bg-muted py-20">
          <div className="container">
            <h2 className="mb-12 text-center text-3xl font-bold tracking-tighter sm:text-4xl">Features</h2>
            <div className="grid gap-8 md:grid-cols-3">
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 rounded-full bg-primary p-3 text-primary-foreground">
                  <Template className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-bold">Professional Templates</h3>
                <p className="text-muted-foreground">
                  Choose from a variety of professionally designed templates to make your resume stand out.
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 rounded-full bg-primary p-3 text-primary-foreground">
                  <FileText className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-bold">Easy Customization</h3>
                <p className="text-muted-foreground">
                  Customize sections, add skills, and tailor your resume to match the job you're applying for.
                </p>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 rounded-full bg-primary p-3 text-primary-foreground">
                  <Share2 className="h-6 w-6" />
                </div>
                <h3 className="mb-2 text-xl font-bold">Shareable Links</h3>
                <p className="text-muted-foreground">
                  Generate a unique link to share your resume with recruiters that stays the same even when you update
                  your resume.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-6">
        <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Resume Builder. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}

