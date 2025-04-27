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
        return <GraduationCap className="h-5 w-5 text-primary" />
      case "EXPERIENCE":
        return <Briefcase className="h-5 w-5 text-primary" />
      case "CERTIFICATIONS":
        return <Award className="h-5 w-5 text-primary" />
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
        <div className="flex items-center gap-3 mb-3">
          {getSectionIcon(section.type)}
          <h3 className="text-xl font-bold tracking-tight">{sectionTitle}</h3>
          <div className="flex-1 h-0.5 bg-gradient-to-r from-primary/50 to-transparent rounded-full" />
        </div>
        <div
          className="prose prose-slate max-w-none dark:prose-invert pl-8"
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
        <div className="flex items-center gap-3 mb-3">
          <h3 className="text-xl font-bold tracking-tight">Skills</h3>
          <div className="flex-1 h-0.5 bg-gradient-to-r from-primary/50 to-transparent rounded-full" />
        </div>
        <div className="flex flex-wrap gap-2">
          {resume.skills.map((skill: ResumeSkill) => (
            <div
              key={skill.id}
              className="px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-primary/5 text-sm font-medium hover:from-primary/20 hover:to-primary/10 transition-colors duration-300 cursor-default"
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
      <div className="mb-6 animate-fadeIn">
        <div className="flex items-center gap-3 mb-3">
          <h3 className="text-xl font-bold tracking-tight">Patents</h3>
          <div className="flex-1 h-0.5 bg-gradient-to-r from-primary/50 to-transparent rounded-full" />
        </div>
        <div className="space-y-4">
          {resume.patents.map((patent: ResumePatent) => (
            <div 
              key={patent.id} 
              className="p-4 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 hover:from-primary/10 hover:to-primary/15 transition-colors duration-300 shadow-sm"
            >
              <h4 className="font-semibold text-lg mb-2">{patent.title}</h4>
              <p className="text-sm text-muted-foreground mb-2">{patent.authors}</p>
              <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                {patent.patentNumber && (
                  <span className="bg-background/50 px-2 py-1 rounded-full">
                    Patent: {patent.patentNumber}
                  </span>
                )}
                {patent.publicationDate && (
                  <span className="bg-background/50 px-2 py-1 rounded-full">
                    Published: {patent.publicationDate}
                  </span>
                )}
                {patent.citations !== null && (
                  <span className="bg-background/50 px-2 py-1 rounded-full">
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-8">
      <div className="container max-w-4xl mx-auto px-4">
        <Card className="overflow-hidden shadow-xl border-0 rounded-2xl">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/70 opacity-90" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.2),transparent_70%)]" />

            <div className="relative p-8 text-white">
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                <Avatar className="h-24 w-24 md:h-32 md:w-32 border-4 border-white/20 shadow-xl hover:scale-105 transition-transform duration-300">
                  <AvatarImage
                    src={resume.user?.image || ""}
                    alt={resume.user?.name || ""}
                    referrerPolicy="no-referrer"
                    loading="eager"
                  />
                  <AvatarFallback className="text-3xl bg-white/10">
                    {resume.user?.name ? resume.user.name.charAt(0).toUpperCase() : <User className="h-12 w-12" />}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div>
                      <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/90">
                        {resume.title}
                      </h1>
                      {resume.user?.name && (
                        <p className="text-xl md:text-2xl opacity-90">{resume.user.name}</p>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {resume.user?.email && (
                        <a 
                          href={`mailto:${resume.user.email}`}
                          className="flex items-center justify-center h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300 transform hover:scale-110"
                          target="_blank"
                          rel="noopener noreferrer"
                          title={resume.user.email}
                        >
                          <Mail className="h-5 w-5" />
                        </a>
                      )}
                      {resume.user?.twitter && (
                        <a 
                          href={`https://twitter.com/${resume.user.twitter}`}
                          className="flex items-center justify-center h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300 transform hover:scale-110"
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Twitter Profile"
                        >
                          <Twitter className="h-5 w-5" />
                        </a>
                      )}
                      {resume.user?.linkedin && (
                        <a 
                          href={resume.user.linkedin.startsWith('http') ? resume.user.linkedin : `https://linkedin.com/in/${resume.user.linkedin}`}
                          className="flex items-center justify-center h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 transition-all duration-300 transform hover:scale-110"
                          target="_blank"
                          rel="noopener noreferrer"
                          title="LinkedIn Profile"
                        >
                          <Linkedin className="h-5 w-5" />
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div
              className="absolute bottom-0 left-0 w-full h-8 bg-white"
              style={{ clipPath: "polygon(0 100%, 100% 0, 100% 100%)" }}
            />
          </div>

          <div className="p-8" ref={resumeRef}>
            {resume.summary && (
              <div className="mb-8 animate-fadeIn">
                <div className="flex items-center gap-3 mb-3">
                  <h2 className="text-xl font-bold tracking-tight">Summary</h2>
                  <div className="flex-1 h-0.5 bg-gradient-to-r from-primary/50 to-transparent rounded-full" />
                </div>
                <p className="text-muted-foreground leading-relaxed text-lg pl-8">{resume.summary}</p>
              </div>
            )}

            <div className="grid md:grid-cols-3 gap-8">
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
            <a href={`${origin}/r/${resume.id}`} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
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
          margin-top: 1.2em;
          margin-bottom: 0.4em;
        }
        .prose p, .prose ul, .prose ol {
          color: hsl(var(--muted-foreground));
          margin-bottom: 0.8em;
        }
        .prose strong {
          color: hsl(var(--primary));
          font-weight: 600;
        }
      `}</style>
    </div>
  )
}