"use client"

import { useState, useRef } from "react"
import { Download, User, ExternalLink, FileText, Mail, Twitter, Linkedin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"

interface ResumeUser {
  name?: string;
  email?: string;
  image?: string;
  twitter?: string;
  linkedin?: string;
}

interface ResumeSkill {
  id: string;
  name: string;
  proficiency: number;
}

interface ResumePatent {
  id: string;
  title: string;
  authors: string;
  patentNumber?: string;
  publicationDate?: string;
  citations?: number | null;
}

interface ResumeSection {
  id: string;
  type: "EDUCATION" | "EXPERIENCE" | "PROJECTS" | "CERTIFICATIONS" | "SKILLS" | "CUSTOM";
  content: string;
}

interface Resume {
  id: string;
  title: string;
  summary?: string;
  user?: ResumeUser;
  skills?: ResumeSkill[];
  patents?: ResumePatent[];
  sections: ResumeSection[];
}

interface ModernTemplateProps {
  resume: Resume;
}

export function ModernTemplate({ resume }: ModernTemplateProps) {
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
      <div key={section.id} className="mb-6 animate-fadeIn">
        <div className="flex items-center gap-2 mb-3">
          <h3 className="text-xl font-semibold text-primary">{sectionTitle}</h3>
          <Separator className="flex-1" />
        </div>
        <div
          className="prose prose-slate max-w-none dark:prose-invert leading-snug"
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
      <div className="mb-6 animate-fadeIn">
        <div className="flex items-center gap-2 mb-3">
          <h3 className="text-xl font-semibold text-primary">Skills</h3>
          <Separator className="flex-1" />
        </div>
        <div className="space-y-2.5">
          {resume.skills.map((skill: ResumeSkill) => (
            <div key={skill.id} className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="font-medium">{skill.name}</span>
                <span className="text-xs text-muted-foreground">{skill.proficiency}%</span>
              </div>
              <Progress value={skill.proficiency} className="h-1.5 bg-muted" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  const renderPatents = () => {
    if (!resume.patents || resume.patents.length === 0) return null

    return (
      <div className="mb-6 animate-fadeIn">
        <div className="flex items-center gap-2 mb-3">
          <h3 className="text-xl font-semibold text-primary">Patents</h3>
          <Separator className="flex-1" />
        </div>
        <div className="space-y-4">
          {resume.patents.map((patent: ResumePatent) => (
            <Card key={patent.id} className="bg-muted/30 border-l-4 border-l-primary">
              <CardContent className="p-4 space-y-1">
                <h4 className="font-medium">{patent.title}</h4>
                <p className="text-sm text-muted-foreground">{patent.authors}</p>
                <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                  {patent.patentNumber && <span>Patent: {patent.patentNumber}</span>}
                  {patent.publicationDate && <span>Published: {patent.publicationDate}</span>}
                  {patent.citations !== null && <span>Citations: {patent.citations}</span>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const handleExport = async (_exportFormat: string) => {
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
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/50  py-10">
      <div className="container max-w-4xl mx-auto px-4">
        <Card className="overflow-hidden shadow-lg border-0 dark:border-gray-700">
          <div className="bg-primary p-6 md:p-8 text-primary-foreground dark:bg-gray-800 dark:text-gray-100 relative">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
            <Avatar className="h-20 w-20 md:h-24 md:w-24 border-4 border-primary-foreground/20 shadow-md">
                <AvatarImage
                  src={resume.user?.image || ''}
                  alt={resume.user?.name || ''}
                  referrerPolicy="no-referrer"
                  loading="eager"
                />
                <AvatarFallback className="text-2xl bg-primary-foreground/10 text-primary-foreground dark:bg-gray-700 dark:text-gray-200">
                  {resume.user?.name ? resume.user.name.charAt(0).toUpperCase() : <User className="h-12 w-12" />}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between w-full gap-2">
                  <div>
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-1">{resume.title}</h1>
                    {resume.user?.name && <p className="text-lg md:text-xl opacity-90 dark:opacity-80">{resume.user.name}</p>}
                  </div>

                  <div className="flex items-center gap-3 mt-2 md:mt-0">
                    {resume.user?.email && (
                      <a
                        href={`mailto:${resume.user.email}`}
                        className="flex items-center justify-center h-10 w-10 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors duration-200"
                        target="_blank"
                        rel="noopener noreferrer"
                        title={resume.user.email}
                      >
                        <Mail className="h-5 w-5 text-foreground" />
                      </a>
                    )}
                    {resume.user?.twitter && (
                      <a
                        href={`https://twitter.com/${resume.user.twitter}`}
                        className="flex items-center justify-center h-10 w-10 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors duration-200"
                        target="_blank"
                        rel="noopener noreferrer"
                        title="Twitter"
                      >
                        <Twitter className="h-5 w-5 text-foreground " />
                      </a>
                    )}
                    {resume.user?.linkedin && (
                      <a
                        href={resume.user.linkedin.startsWith('http') ? resume.user.linkedin : `https://linkedin.com/in/${resume.user.linkedin}`}
                        className="flex items-center justify-center h-10 w-10 rounded-full bg-primary-foreground/10 hover:bg-primary-foreground/20 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors duration-200"
                        target="_blank"
                        rel="noopener noreferrer"
                        title="LinkedIn"
                      >
                        <Linkedin className="h-5 w-5 text-foreground " />
                      </a>
                    )}
                  </div>
                </div>

              </div>
            </div>
          </div>

          <div className="p-6 md:p-8" ref={resumeRef}>
            {resume.summary && (
              <div className="mb-6 animate-fadeIn">
                <div className="flex items-center gap-2 mb-3">
                  <h2 className="text-xl font-semibold text-primary">Summary</h2>
                  <Separator className="flex-1" />
                </div>
                <p className="text-muted-foreground leading-snug">{resume.summary}</p>
              </div>
            )}

            <div className="grid md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                {resume.sections.filter((s: ResumeSection) => s.type !== "SKILLS").map(renderSection)}
              </div>
              <div className="space-y-6">
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
            {/* @ts-ignore */}
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
          color: hsl(var(--primary));
          margin-top: 1.2em;
          margin-bottom: 0.4em;
        }
        .prose p, .prose ul, .prose ol {
          margin-top: 0.4em;
          margin-bottom: 0.4em;
          line-height: 1.4;
        }
      `}</style>
    </div>
  )
}