"use client"

import { Button } from "@/components/ui/button"
import { ExternalLink } from "lucide-react"
import Image from "next/image"

interface TemplatePreviewProps {
  template: string
  onClick?: () => void
}

export function TemplatePreview({ template, onClick }: TemplatePreviewProps) {
  const getTemplateImage = () => {
    switch (template) {
      case "modern":
        return "/templates/modern-preview.png"
      case "creative":
        return "/templates/creative-preview.png"
      case "classic":
      default:
        return "/templates/classic-preview.png"
    }
  }

  const getTemplateDescription = () => {
    switch (template) {
      case "modern":
        return "A clean, contemporary design with a focus on skills and achievements."
      case "creative":
        return "A bold, distinctive layout that showcases your personality and creativity."
      case "classic":
      default:
        return "A traditional, professional layout suitable for all industries and experience levels."
    }
  }

  return (
    <div className="flex flex-col md:flex-row gap-6 items-center">
      <div className="relative w-full md:w-1/3 aspect-[3/4] bg-background rounded-md overflow-hidden border shadow-sm">
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        <Image
          src={getTemplateImage() || "/placeholder.svg"}
          alt={`${template} template preview`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
      </div>
      <div className="w-full md:w-2/3 space-y-4">
        <h3 className="text-xl font-semibold capitalize">{template} Template</h3>
        <p className="text-muted-foreground">{getTemplateDescription()}</p>
        <Button variant="outline" onClick={onClick} className="mt-4">
          <ExternalLink className="mr-2 h-4 w-4" />
          Preview Resume
        </Button>
      </div>
    </div>
  )
}
