"use client"

import { useState } from "react"
import { Download, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"

interface ResumeViewProps {
  resume: any
}

export function ResumeView({ resume }: ResumeViewProps) {
  const [template, setTemplate] = useState("modern")

  const renderSection = (section: any) => {
    return (
      <div key={section.id} className="mb-6">
        <h3 className="text-lg font-bold mb-2">
          {section.type === "EDUCATION"
            ? "Education"
            : section.type === "EXPERIENCE"
              ? "Experience"
              : section.type === "PROJECTS"
                ? "Projects"
                : section.type === "CERTIFICATIONS"
                  ? "Certifications"
                  : section.type === "SKILLS"
                    ? "Skills"
                    : "Custom"}
        </h3>
        <div
          className="prose prose-sm max-w-none"
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
      <div className="mb-6">
        <h3 className="text-lg font-bold mb-2">Skills</h3>
        <div className="grid gap-2">
          {resume.skills.map((skill: any) => (
            <div key={skill.id} className="flex flex-col">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium">{skill.name}</span>
                <span className="text-xs text-muted-foreground">{skill.proficiency}%</span>
              </div>
              <Progress value={skill.proficiency} className="h-2" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-muted py-8">
      <div className="container max-w-4xl">
        <div className="bg-background rounded-lg shadow-lg overflow-hidden">
          <div className="p-8">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h1 className="text-3xl font-bold">{resume.title}</h1>
                {resume.user?.name && <p className="text-xl text-muted-foreground mt-1">{resume.user.name}</p>}
              </div>
              <Avatar className="h-16 w-16">
                <AvatarImage src={resume.user?.image || ""} alt={resume.user?.name || ""} />
                <AvatarFallback>
                  <User className="h-8 w-8" />
                </AvatarFallback>
              </Avatar>
            </div>

            {resume.summary && (
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-2">Professional Summary</h2>
                <p className="text-muted-foreground">{resume.summary}</p>
              </div>
            )}

            <div className="grid md:grid-cols-3 gap-8">
              <div className="md:col-span-2">
                {resume.sections.filter((s: any) => s.type !== "SKILLS").map(renderSection)}
              </div>
              <div>
                {renderSkills()}
                {resume.sections.filter((s: any) => s.type === "SKILLS").map(renderSection)}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <Button variant="outline" className="mr-4">
            <Download className="mr-2 h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </div>
    </div>
  )
}

