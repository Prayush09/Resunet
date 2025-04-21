"use client"

import { useState, useRef } from "react"
import { Download, User, ExternalLink, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"

// Define proper types for the resume and its components
interface Skill {
  id: string
  name: string
  proficiency: number
}

interface Patent {
  id: string
  title: string
  authors: string
  patentNumber?: string
  publicationDate?: string
  citations?: number | null
}

interface ResumeUser {
  id?: string
  name?: string
  email?: string
  image?: string | null
}

interface ResumeSection {
  id: string
  type: "EDUCATION" | "EXPERIENCE" | "PROJECTS" | "CERTIFICATIONS" | "SKILLS" | "CUSTOM"
  content: string
}

interface Resume {
  id: string
  title: string
  summary?: string
  user?: ResumeUser
  sections: ResumeSection[]
  skills?: Skill[]
  patents?: Patent[]
}

interface ClassicTemplateProps {
  resume: Resume
}

export function ClassicTemplate({ resume }: ClassicTemplateProps) {
  const { toast } = useToast()
  const resumeRef = useRef<HTMLDivElement>(null)
  const [isExporting, setIsExporting] = useState(false)

  const renderSection = (section: ResumeSection) => {
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

    return (
      <div key={section.id} className="mb-8 animate-fadeIn">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-xl font-bold tracking-tight">{sectionTitle}</h3>
          <Separator className="flex-1" />
        </div>
        <div
          className="prose prose-slate max-w-none dark:prose-invert"
          dangerouslySetInnerHTML={{
            __html: section.content,
          }}
        />
      </div>
    )
  }

  const renderSkills = () => {
    if (!resume.skills || resume.skills.length === 0) return null

    return (
      <div className="mb-8 animate-fadeIn">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-xl font-bold tracking-tight">Skills</h3>
          <Separator className="flex-1" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {resume.skills.map((skill: Skill) => (
            <Card key={skill.id} className="overflow-hidden border-0 shadow-sm bg-muted/30">
              <CardContent className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">{skill.name}</span>
                  <span className="text-xs text-muted-foreground bg-background px-2 py-1 rounded-full">
                    {skill.proficiency}%
                  </span>
                </div>
                <Progress value={skill.proficiency} className="h-2 bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const renderPatents = () => {
    if (!resume.patents || resume.patents.length === 0) return null

    return (
      <div className="mb-8 animate-fadeIn">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-xl font-bold tracking-tight">Patents</h3>
          <Separator className="flex-1" />
        </div>
        <div className="space-y-4">
          {resume.patents.map((patent: Patent) => (
            <div key={patent.id} className="border-l-2 border-primary/20 pl-4">
              <h4 className="font-medium">{patent.title}</h4>
              <p className="text-sm text-muted-foreground">{patent.authors}</p>
              <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                {patent.patentNumber && <span>Patent: {patent.patentNumber}</span>}
                {patent.publicationDate && <span>Published: {patent.publicationDate}</span>}
                {patent.citations !== null && <span>Citations: {patent.citations}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  const handleExport = async (_exportType: string) => {
    setIsExporting(true)
    try {
      toast({
        title: "Export functionality",
        description: "Export will be implemented in the future",
      })
    } catch (error) {
      console.error("Export error:", error)
      toast({
        title: "Export failed",
        description: "Failed to export resume. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/50 py-12">
      <div className="container max-w-4xl mx-auto px-4">
        <Card className="overflow-hidden shadow-lg border-0">
          {/* Header with background gradient */}
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-8 relative">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <Avatar className="h-24 w-24 border-4 border-background shadow-md">
                <AvatarImage
                  src={resume.user?.image || ""}
                  alt={resume.user?.name || ""}
                  referrerPolicy="no-referrer"
                  loading="eager"
                />
                <AvatarFallback className="text-2xl bg-primary/20">
                  {resume.user?.name ? resume.user.name.charAt(0).toUpperCase() : <User className="h-12 w-12" />}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-1">{resume.title}</h1>
                {resume.user?.name && <p className="text-xl text-muted-foreground">{resume.user.name}</p>}
              </div>
            </div>
          </div>

          {/* Resume content */}
          <div className="p-8" ref={resumeRef}>
            {resume.summary && (
              <div className="mb-8 animate-fadeIn">
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="text-xl font-bold tracking-tight">Summary</h2>
                  <Separator className="flex-1" />
                </div>
                <p className="text-muted-foreground leading-relaxed">{resume.summary}</p>
              </div>
            )}

            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-8">
                {resume.sections.filter((s: ResumeSection) => s.type !== "SKILLS").map(renderSection)}
              </div>
              <div className="space-y-8">
                {renderSkills()}
                {renderPatents()}
                {resume.sections.filter((s: ResumeSection) => s.type === "SKILLS").map(renderSection)}
              </div>
            </div>
          </div>
        </Card>

        <div className="mt-8 flex justify-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="group" disabled={isExporting}>
                <Download className="mr-2 h-4 w-4 transition-transform group-hover:-translate-y-1" />
                {isExporting ? "Exporting..." : "Export"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center">
              <DropdownMenuItem onClick={() => handleExport("pdf")}>
                <FileText className="mr-2 h-4 w-4" />
                <span>PDF</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("markdown")}>
                <FileText className="mr-2 h-4 w-4" />
                <span>Markdown</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("json")}>
                <FileText className="mr-2 h-4 w-4" />
                <span>JSON</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" className="group" asChild>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <a href={`${window.location.origin}/r/${resume.id}`} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              Share Link
            </a>
          </Button>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out forwards;
        }
        .prose h1, .prose h2, .prose h3, .prose h4 {
          color: hsl(var(--foreground));
          margin-top: 1.5em;
          margin-bottom: 0.5em;
        }
        .prose p, .prose ul, .prose ol {
          color: hsl(var(--muted-foreground));
          margin-bottom: 1em;
        }
        .prose strong {
          color: hsl(var(--foreground));
          font-weight: 600;
        }
      `}</style>
    </div>
  )
}