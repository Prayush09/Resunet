"use client"

import { useState, useRef } from "react"
import { Download, User, ExternalLink, FileText, Mail, Linkedin, Twitter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"

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
  linkedin?: string
  twitter?: string
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
      <div key={section.id} className="mb-4 animate-fadeIn hover:translate-x-1 transition-transform duration-300">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="text-lg font-bold tracking-tight text-primary">{sectionTitle}</h3>
          <Separator className="flex-1" />
        </div>
        <div
          className="prose prose-slate max-w-none dark:prose-invert pl-3"
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
      <div className="mb-4 animate-fadeIn">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="text-lg font-bold tracking-tight text-primary">Skills</h3>
          <Separator className="flex-1" />
        </div>
        <div className="grid gap-2">
          {resume.skills.map((skill: Skill) => (
            <Card 
              key={skill.id} 
              className="overflow-hidden border border-primary/10 shadow-sm hover:shadow-md transition-shadow duration-300 bg-gradient-to-r from-background to-primary/5"
            >
              <CardContent className="p-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-medium text-primary">{skill.name}</span>
                  <span className="text-xs bg-primary/10 px-2 py-0.5 rounded-full">
                    {skill.proficiency}%
                  </span>
                </div>
                <Progress 
                  value={skill.proficiency} 
                  className="h-2 bg-primary/10" 
                />
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
      <div className="mb-4 animate-fadeIn">
        <div className="flex items-center gap-2 mb-2">
          <h3 className="text-lg font-bold tracking-tight text-primary">Patents</h3>
          <Separator className="flex-1" />
        </div>
        <div className="space-y-3">
          {resume.patents.map((patent: Patent) => (
            <div 
              key={patent.id} 
              className="border-l-2 border-primary pl-3 py-2 hover:bg-primary/5 transition-colors duration-300 rounded-r-lg"
            >
              <h4 className="font-semibold text-base mb-1">{patent.title}</h4>
              <p className="text-sm text-muted-foreground mb-1">{patent.authors}</p>
              <div className="flex flex-wrap gap-1 text-xs text-muted-foreground">
                {patent.patentNumber && (
                  <span className="bg-primary/5 px-2 py-0.5 rounded-full">
                    Patent: {patent.patentNumber}
                  </span>
                )}
                {patent.publicationDate && (
                  <span className="bg-primary/5 px-2 py-0.5 rounded-full">
                    Published: {patent.publicationDate}
                  </span>
                )}
                {patent.citations !== null && (
                  <span className="bg-primary/5 px-2 py-0.5 rounded-full">
                    Citations: {patent.citations}
                  </span>
                )}
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
    <div className="min-h-screen bg-gradient-to-b from-background to-primary/5 py-8">
      <div className="container max-w-4xl mx-auto px-4">
        <Card className="overflow-hidden shadow-xl border-0 rounded-xl">
          <div className="bg-gradient-to-r from-primary/20 to-primary/5 p-6">
            <div className="flex flex-col md:flex-row md:items-center gap-4">
              <Avatar className="h-24 w-24 md:h-28 md:w-28 border-4 border-background shadow-xl hover:scale-105 transition-transform duration-300">
                <AvatarImage
                  src={resume.user?.image || ""}
                  alt={resume.user?.name || ""}
                  referrerPolicy="no-referrer"
                  loading="eager"
                />
                <AvatarFallback className="text-2xl bg-primary/10">
                  {resume.user?.name ? resume.user.name.charAt(0).toUpperCase() : <User className="h-12 w-12" />}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-1 text-primary">{resume.title}</h1>
                    {resume.user?.name && (
                      <p className="text-lg text-muted-foreground">{resume.user.name}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {resume.user?.email && (
                      <a 
                        href={`mailto:${resume.user.email}`}
                        className="flex items-center justify-center h-9 w-9 rounded-full bg-primary/10 hover:bg-primary/20 transition-all duration-300 transform hover:scale-110"
                        target="_blank"
                        rel="noopener noreferrer"
                        title={resume.user.email}
                      >
                        <Mail className="h-4 w-4 text-foreground" />
                      </a>
                    )}
                    {resume.user?.twitter && (
                      <a 
                        href={`https://twitter.com/${resume.user.twitter}`}
                        className="flex items-center justify-center h-9 w-9 rounded-full bg-primary/10 hover:bg-primary/20 transition-all duration-300 transform hover:scale-110"
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Twitter Profile"
                      >
                        <Twitter className="h-4 w-4 text-foreground" />
                      </a>
                    )}
                    {resume.user?.linkedin && (
                      <a 
                        href={resume.user.linkedin.startsWith('http') ? resume.user.linkedin : `https://linkedin.com/in/${resume.user.linkedin}`}
                        className="flex items-center justify-center h-9 w-9 rounded-full bg-primary/10 hover:bg-primary/20 transition-all duration-300 transform hover:scale-110"
                        target="_blank"
                        rel="noopener noreferrer"
                        title="LinkedIn Profile"
                      >
                        <Linkedin className="h-4 w-4 text-foreground" />
                      </a>
                    )}
                  </div>
                </div>

                {resume.user?.email && (
                  <div className="mt-2 md:mt-1">
                    <div className="inline-flex items-center gap-1 text-xs bg-primary/10 px-2 py-1 rounded-full">
                      <Mail className="h-3 w-3 text-primary" />
                      <span>{resume.user.email}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="p-6" ref={resumeRef}>
            {resume.summary && (
              <div className="mb-5 animate-fadeIn">
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-lg font-bold tracking-tight text-primary">Summary</h2>
                  <Separator className="flex-1" />
                </div>
                <p className="text-muted-foreground leading-tight text-base pl-3">{resume.summary}</p>
              </div>
            )}

            <div className="grid md:grid-cols-3 gap-4">
              <div className="md:col-span-2 space-y-4">
                {resume.sections.filter((s: ResumeSection) => s.type !== "SKILLS").map(renderSection)}
              </div>
              <div className="space-y-4">
                {renderSkills()}
                {renderPatents()}
                {resume.sections.filter((s: ResumeSection) => s.type === "SKILLS").map(renderSection)}
              </div>
            </div>
          </div>
        </Card>

        <div className="mt-6 flex justify-center gap-4">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="lg" className="group" disabled={isExporting}>
                <Download className="mr-2 h-5 w-5 transition-transform group-hover:-translate-y-1" />
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

          <Button variant="outline" size="lg" className="group" asChild>
            <a href={`${window.location.origin}/r/${resume.id}`} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              Share Link
            </a>
          </Button>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
        }
        .prose h1, .prose h2, .prose h3, .prose h4 {
          color: hsl(var(--primary));
          margin-top: 0.8em;
          margin-bottom: 0.3em;
          line-height: 1.15;
        }
        .prose p, .prose ul, .prose ol {
          color: hsl(var(--muted-foreground));
          margin-bottom: 0.6em;
          line-height: 1.15;
        }
        .prose ul, .prose ol {
          padding-left: 1.25rem;
        }
        .prose li {
          margin-bottom: 0.2em;
          line-height: 1.15;
        }
        .prose strong {
          color: hsl(var(--primary));
          font-weight: 600;
        }
      `}</style>
    </div>
  )
}
