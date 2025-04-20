"use client"
import { ClassicTemplate } from "@/components/resume-templates/classic-template"
import { ModernTemplate } from "@/components/resume-templates/modern-template"
import { CreativeTemplate } from "@/components/resume-templates/creative-template"
import ParticlesBackground from "@/components/ui/particle-background"

interface ResumeViewProps {
  resume: any
}

export function ResumeView({ resume }: ResumeViewProps) {
  // Determine which template to use based on the resume's template field
  const renderTemplate = () => {
    switch (resume.template) {
      case "modern":
        return <ModernTemplate resume={resume} />
      case "creative":
        return <CreativeTemplate resume={resume} />
      case "classic":
      default:
        return <ClassicTemplate resume={resume} />
    }
  }

  return (
    <>
    <ParticlesBackground />
      {renderTemplate()}
    </>
  )
}
