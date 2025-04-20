"use client"

import { useState, useRef, useEffect } from "react"
import { Download, User, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import ParticleBackground from "@/components/ui/particle-background" 

interface ResumeViewProps {
  resume: any
}

export function ResumeView({ resume }: ResumeViewProps) {
  const [shareLink, setShareLink] = useState<string>("")
  const [template, setTemplate] = useState("modern")
  const resumeRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Only set share link on client-side
    if (typeof window !== 'undefined') {
      setShareLink(`${window.location.origin}/r/${resume.id}`)
    }
  }, [resume.id])

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
          className="prose prose-slate max-w-none dark:prose-invert rich-text-content"
          dangerouslySetInnerHTML={{ __html: section.content }}
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
            <Card
              key={skill.id}
              className="overflow-hidden border-0 shadow-sm bg-muted/30 flex flex-col"
            >
              <CardContent className="p-4 flex-1 flex flex-col">
                <div className="flex flex-col space-y-2">
                  <span className="font-medium text-sm w-full break-words mb-1">
                    {skill.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <Progress
                      value={skill.proficiency}
                      className="h-2 bg-muted flex-1"
                    />
                    <span className="text-xs text-muted-foreground bg-background  rounded-full">
                      {skill.proficiency}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  const handleDownloadPDF = () => {
    //TODO: #1 add a function to fetch the certificates of people from different sites, like if google certificates are available from scholar, fetch them and show them in the resume.
    //TODO: #1 This is a placeholder for PDF download functionality
    alert("PDF download functionality would be implemented here")
  }

  const renderPatents = () => {
    if (!resume.patents || resume.patents.length === 0) return null;

    return (
      <div className="mb-8 animate-fadeIn">
        <div className="flex items-center gap-2 mb-4">
          <h3 className="text-xl font-bold tracking-tight">Patents</h3>
          <Separator className="flex-1" />
        </div>
        <div className="space-y-4">
          {resume.patents.map((patent: any) => (
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
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/50 py-12">
      <ParticleBackground />
      <div className="container max-w-4xl mx-auto px-4">
        <Card className="overflow-hidden shadow-lg border-0">
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
                <div className="text-muted-foreground leading-relaxed prose prose-slate max-w-none dark:prose-invert rich-text-content">
                  {/* If summary is already HTML, render it that way, otherwise treat as plain text */}
                  {resume.summary.startsWith('<') ? (
                    <div dangerouslySetInnerHTML={{ __html: resume.summary }} />
                  ) : (
                    <p>{resume.summary}</p>
                  )}
                </div>
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
        
        /* Rich text content styling to match TipTap editor output */
        .rich-text-content {
          line-height: 1.6;
        }
        
        .rich-text-content h1 {
          font-size: 2em;
          font-weight: 700;
          margin-top: 0.67em;
          margin-bottom: 0.67em;
        }
        
        .rich-text-content h2 {
          font-size: 1.5em;
          font-weight: 700;
          margin-top: 0.83em;
          margin-bottom: 0.83em;
        }
        
        .rich-text-content h3 {
          font-size: 1.17em;
          font-weight: 700;
          margin-top: 1em;
          margin-bottom: 1em;
        }
        
        .rich-text-content strong {
          font-weight: 700;
          color: hsl(var(--foreground));
        }
        
        .rich-text-content em {
          font-style: italic;
        }
        
        .rich-text-content u {
          text-decoration: underline;
        }
        
        .rich-text-content ul {
          list-style-type: disc;
          padding-left: 1.5em;
          margin: 1em 0;
        }
        
        .rich-text-content ol {
          list-style-type: decimal;
          padding-left: 1.5em;
          margin: 1em 0;
        }
        
        .rich-text-content li {
          margin-bottom: 0.5em;
        }
        
        .rich-text-content a {
          color: hsl(var(--primary));
          text-decoration: underline;
        }
        
        .rich-text-content blockquote {
          border-left: 3px solid hsl(var(--border));
          padding-left: 1em;
          margin-left: 0;
          color: hsl(var(--muted-foreground));
        }
        
        .rich-text-content code {
          font-family: monospace;
          background-color: hsl(var(--muted));
          padding: 0.2em 0.4em;
          border-radius: 3px;
          font-size: 0.9em;
        }
        
        .rich-text-content pre {
          background-color: hsl(var(--muted));
          padding: 1em;
          border-radius: 5px;
          overflow-x: auto;
          margin: 1em 0;
        }
        
        .rich-text-content pre code {
          background-color: transparent;
          padding: 0;
          font-size: 0.9em;
        }
        
        .rich-text-content img {
          max-width: 100%;
          height: auto;
        }
        
        .rich-text-content p {
          margin: 1em 0;
        }
        
        .rich-text-content [data-align="center"] {
          text-align: center;
        }
        
        .rich-text-content [data-align="right"] {
          text-align: right;
        }
        
        .rich-text-content [data-align="justify"] {
          text-align: justify;
        }
        
        .rich-text-content mark {
          background-color: hsl(var(--primary) / 0.2);
          padding: 0.1em 0;
        }
      `}</style>
    </div>
  )
}