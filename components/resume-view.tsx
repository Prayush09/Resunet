"use client"

import { useState, useRef } from "react"
import { Download, User, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

interface ResumeViewProps {
  resume: any
}

export function ResumeView({ resume }: ResumeViewProps) {
  const [template, setTemplate] = useState("modern")
  const resumeRef = useRef<HTMLDivElement>(null)

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
          <h3 className="text-xl font-bold tracking-tight">{sectionTitle}</h3>
          <Separator className="flex-1" />
        </div>
        <div
          className="prose prose-slate max-w-none dark:prose-invert"
          dangerouslySetInnerHTML={{
            __html: section.content.split("\n").join("<br />"),
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
          {resume.skills.map((skill: any) => (
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

  const handleDownloadPDF = () => {
    // This is a placeholder for PDF download functionality
    alert("PDF download functionality would be implemented here")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/50 py-12">
      <div className="container max-w-4xl mx-auto px-4">
        <Card className="overflow-hidden shadow-lg border-0">
          {/* Header with background gradient */}
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 p-8 relative">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <Avatar className="h-24 w-24 border-4 border-background shadow-md">
                <AvatarImage src={resume.user?.image || ""} alt={resume.user?.name || ""} />
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
                {resume.sections.filter((s: any) => s.type !== "SKILLS").map(renderSection)}
              </div>
              <div className="space-y-8">
                {renderSkills()}
                {resume.sections.filter((s: any) => s.type === "SKILLS").map(renderSection)}
              </div>
            </div>
          </div>
        </Card>

        <div className="mt-8 flex justify-center gap-4">
          <Button variant="outline" onClick={handleDownloadPDF} className="group">
            <Download className="mr-2 h-4 w-4 transition-transform group-hover:-translate-y-1" />
            Download PDF
          </Button>
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
          color: hsl(var(--foreground));
          font-weight: 600;
        }
      `}</style>
    </div>
  )
}

