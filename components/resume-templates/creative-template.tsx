"use client"

import { useState, useRef, useEffect } from "react"
import { Download, User, ExternalLink, FileText, Mail, Award, Briefcase, GraduationCap, Linkedin, Twitter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"

interface ResumeUser {
  name?: string;
  email?: string;
  image?: string;
  linkedin?: string;
  twitter?: string;
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

interface CreativeTemplateProps {
  resume: Resume;
}

export function CreativeTemplate({ resume }: CreativeTemplateProps) {
  const { toast } = useToast()
  const resumeRef = useRef<HTMLDivElement>(null)
  const [isExporting, setIsExporting] = useState(false)
  const [origin, setOrigin] = useState("")

  useEffect(() => {
    setOrigin(typeof window !== "undefined" ? window.location.origin : "")
  }, []);

  const getSectionIcon = (type: string) => {
    switch (type) {
      case "EDUCATION":
        return <GraduationCap className="h-4 w-4 text-primary" />
      case "EXPERIENCE":
        return <Briefcase className="h-4 w-4 text-primary" />
      case "CERTIFICATIONS":
        return <Award className="h-4 w-4 text-primary" />
      default:
        return null
    }
  }

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
      <div key={section.id} className="mb-6 animate-fadeIn hover:translate-x-1 transition-transform">
        <div className="flex items-center gap-3 mb-2">
          {getSectionIcon(section.type)}
          <h3 className="text-xl font-bold tracking-tight">{sectionTitle}</h3>
          <div className="flex-1 h-0.5 bg-gradient-to-r from-primary/50 to-transparent rounded-full" />
        </div>
        <div
          className="prose prose-sm max-w-none dark:prose-invert pl-8 [&_p]:leading-relaxed [&_li]:leading-relaxed"
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
          <h3 className="text-lg font-bold tracking-tight">Skills</h3>
          <div className="flex-1 h-0.5 bg-gradient-to-r from-primary/50 to-transparent rounded-full" />
        </div>
        <div className="flex flex-wrap gap-1.5 pl-6">
          {resume.skills.map((skill: ResumeSkill) => (
            <div
              key={skill.id}
              className="px-3 py-1 rounded-full bg-gradient-to-r from-primary/10 to-primary/5 text-xs font-medium hover:from-primary/20 hover:to-primary/10 transition-colors duration-300 cursor-default"
              style={{ opacity: 0.6 + skill.proficiency / 200 }}
            >
              {skill.name}
            </div>
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
          <h3 className="text-lg font-bold tracking-tight">Patents</h3>
          <div className="flex-1 h-0.5 bg-gradient-to-r from-primary/50 to-transparent rounded-full" />
        </div>
        <div className="space-y-3 pl-6">
          {resume.patents.map((patent: ResumePatent) => (
            <div 
              key={patent.id} 
              className="p-3 rounded-lg bg-gradient-to-br from-primary/5 to-primary/10 hover:from-primary/10 hover:to-primary/15 transition-colors duration-300 shadow-sm"
            >
              <h4 className="font-semibold text-base mb-1">{patent.title}</h4>
              <p className="text-xs text-muted-foreground mb-1.5">{patent.authors}</p>
              <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                {patent.patentNumber && (
                  <span className="bg-background/50 px-1.5 py-0.5 rounded-full">
                    Patent: {patent.patentNumber}
                  </span>
                )}
                {patent.publicationDate && (
                  <span className="bg-background/50 px-1.5 py-0.5 rounded-full">
                    Published: {patent.publicationDate}
                  </span>
                )}
                {patent.citations !== null && (
                  <span className="bg-background/50 px-1.5 py-0.5 rounded-full">
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 dark:from-background dark:via-background dark:to-primary/10 py-8">
      <div className="container max-w-4xl mx-auto px-4">
        <Card className="overflow-hidden shadow-xl border-0 rounded-2xl">
          <div className="relative">
            <div className='absolute inset-0 bg-gradient-to-r from-black to-gray-100 dark:from-gray-900 dark:to-slate-950 opacity-85' />
            <div className='absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(0,0,0,0.1),transparent_75%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.05),transparent_75%)]' />
            <div className="relative p-5 text-white">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <Avatar className="h-20 w-20 md:h-24 md:w-24 border-4 border-white/20 dark:border-white/10 shadow-xl hover:scale-105 transition-transform duration-300">
                  <AvatarImage
                    src={resume.user?.image || ""}
                    alt={resume.user?.name || ""}
                    referrerPolicy="no-referrer"
                    loading="eager"
                  />
                  <AvatarFallback className="text-2xl bg-white/10 dark:bg-white/5">
                    {resume.user?.name ? resume.user.name.charAt(0).toUpperCase() : <User className="h-10 w-10" />}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                    <div>
                      <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-1 text-white dark:text-white/95">
                        {resume.title}
                      </h1>
                      {resume.user?.name && (
                        <p className="text-lg md:text-xl text-white/90 dark:text-white/80">{resume.user.name}</p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {resume.user?.email && (
                        <a 
                          href={`mailto:${resume.user.email}`}
                          className="flex items-center justify-center h-8 w-8 rounded-full bg-black/10 hover:bg-black/20 dark:bg-white/5 dark:hover:bg-white/15 transition-all duration-300 transform hover:scale-110"
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
                          className="flex items-center justify-center h-8 w-8 rounded-full bg-black/10  hover:bg-black/20 dark:bg-white/5 dark:hover:bg-white/15 transition-all duration-300 transform hover:scale-110"
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Twitter Profile"
                        >
                          <Twitter className="h-4 w-4 text-foreground"/>
                        </a>
                      )}
                      {resume.user?.linkedin && (
                        <a 
                          href={resume.user.linkedin.startsWith('http') ? resume.user.linkedin : `https://linkedin.com/in/${resume.user.linkedin}`}
                          className="flex items-center justify-center h-8 w-8 rounded-full bg-black/10  hover:bg-black/20 dark:bg-white/5 dark:hover:bg-white/15 transition-all duration-300 transform hover:scale-110"
                          target="_blank"
                          rel="noopener noreferrer"
                          title="LinkedIn Profile"
                        >
                          <Linkedin  className="h-4 w-4 text-foreground" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div
              className="absolute bottom-0 left-0 w-full h-6 bg-card dark:bg-card"
              style={{ clipPath: "polygon(0 100%, 100% 0, 100% 100%)" }}
            />
          </div>

          <div className="p-8" ref={resumeRef}>
          {resume.summary && (
              <div className="mb-6 animate-fadeIn">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-xl font-bold tracking-tight">Summary</h2>
                  <div className="flex-1 h-0.5 bg-gradient-to-r from-gray-500 to-transparent dark:from-primary-400/30 dark:to-transparent rounded-full" />
                </div>
                <div
                  className="prose prose-sm max-w-none dark:prose-invert pl-8 [&_p]:leading-relaxed [&_li]:leading-relaxed"
                  dangerouslySetInnerHTML={{
                    __html: resume.summary,
                  }}
                />
              </div>
          )}

            <div className="grid md:grid-cols-3 gap-5">
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

        <div className="mt-4 flex justify-center gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="group" disabled={isExporting}>
                <Download className="mr-1.5 h-4 w-4 transition-transform group-hover:-translate-y-0.5" />
                {isExporting ? "Exporting..." : "Export"}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center">
              <DropdownMenuItem onClick={() => handleExport("pdf")}>
                <FileText className="mr-1.5 h-3.5 w-3.5" />
                <span>PDF</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("markdown")}>
                <FileText className="mr-1.5 h-3.5 w-3.5" />
                <span>Markdown</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("json")}>
                <FileText className="mr-1.5 h-3.5 w-3.5" />
                <span>JSON</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button variant="outline" size="sm" className="group" asChild>
            <a href={`${origin}/r/${resume.id}`} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-1.5 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              Share Link
            </a>
          </Button>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
        }
        .prose h1, .prose h2, .prose h3, .prose h4 {
          color: hsl(var(--foreground));
          margin-top: 0.8em;
          margin-bottom: 0.3em;
          line-height: 1.15;
        }
        .prose p, .prose ul, .prose ol {
          color: hsl(var(--muted-foreground));
          margin-bottom: 0.5em;
          line-height: 1.15;
        }
        .prose li {
          margin-top: 0.2em;
          margin-bottom: 0.2em;
        }
        .prose strong {
          color: hsl(var(--primary));
          font-weight: 600;
        }
      `}</style>
    </div>
  )
}
