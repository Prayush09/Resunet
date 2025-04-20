"use client"

import { useState, useRef } from "react"
import { Download, User, ExternalLink, FileText, Mail, Award, Briefcase, GraduationCap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/hooks/use-toast"

interface CreativeTemplateProps {
  resume: any
}

export function CreativeTemplate({ resume }: CreativeTemplateProps) {
  const { toast } = useToast()
  const resumeRef = useRef<HTMLDivElement>(null)
  const [isExporting, setIsExporting] = useState(false)

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

  const renderSection = (section: any) => {
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
          {getSectionIcon(section.type)}
          <h3 className="text-xl font-bold">{sectionTitle}</h3>
          <div className="flex-1 h-0.5 bg-gradient-to-r from-primary/50 to-transparent rounded-full" />
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
          <h3 className="text-xl font-bold">Skills</h3>
          <div className="flex-1 h-0.5 bg-gradient-to-r from-primary/50 to-transparent rounded-full" />
        </div>
        <div className="flex flex-wrap gap-2">
          {resume.skills.map((skill: any) => (
            <div
              key={skill.id}
              className="px-3 py-1.5 rounded-full bg-primary/10 text-sm font-medium"
              style={{ opacity: 0.5 + skill.proficiency / 200 }}
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
      <div className="mb-8 animate-fadeIn">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-xl font-bold">Patents</h3>
          <div className="flex-1 h-0.5 bg-gradient-to-r from-primary/50 to-transparent rounded-full" />
        </div>
        <div className="space-y-4">
          {resume.patents.map((patent: any) => (
            <div key={patent.id} className="p-4 rounded-lg bg-gradient-to-br from-primary/5 to-primary/10">
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

  const handleExport = async (format: string) => {
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-12">
      <div className="container max-w-4xl mx-auto px-4">
        <Card className="overflow-hidden shadow-lg border-0">
          {/* Header with creative design */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/70 opacity-90" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_70%)]" />

            <div className="relative p-8 text-white">
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                <Avatar className="h-28 w-28 border-4 border-white/20 shadow-lg">
                  <AvatarImage
                    src={resume.user?.image || ""}
                    alt={resume.user?.name || ""}
                    referrerPolicy="no-referrer"
                    loading="eager"
                  />
                  <AvatarFallback className="text-3xl bg-white/10">
                    {resume.user?.name ? resume.user.name.charAt(0).toUpperCase() : <User className="h-14 w-14" />}
                  </AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">{resume.title}</h1>
                  {resume.user?.name && <p className="text-2xl opacity-90">{resume.user.name}</p>}
                  <div className="flex flex-wrap gap-4 mt-4">
                    {resume.user?.email && (
                      <div className="flex items-center gap-1 text-sm bg-white/10 px-3 py-1 rounded-full">
                        <Mail className="h-4 w-4" />
                        <span>{resume.user.email}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Decorative elements */}
            <div
              className="absolute bottom-0 left-0 w-full h-8 bg-white"
              style={{ clipPath: "polygon(0 100%, 100% 0, 100% 100%)" }}
            />
          </div>

          {/* Resume content */}
          <div className="p-8 pt-12" ref={resumeRef}>
            {resume.summary && (
              <div className="mb-8 animate-fadeIn">
                <div className="flex items-center gap-2 mb-4">
                  <h2 className="text-xl font-bold">Summary</h2>
                  <div className="flex-1 h-0.5 bg-gradient-to-r from-primary/50 to-transparent rounded-full" />
                </div>
                <p className="text-muted-foreground leading-relaxed">{resume.summary}</p>
              </div>
            )}

            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-8">
                {resume.sections.filter((s: any) => s.type !== "SKILLS").map(renderSection)}
              </div>
              <div className="space-y-8">
                {renderSkills()}
                {renderPatents()}
                {resume.sections.filter((s: any) => s.type === "SKILLS").map(renderSection)}
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
          color: hsl(var(--primary));
          font-weight: 600;
        }
      `}</style>
    </div>
  )
}
