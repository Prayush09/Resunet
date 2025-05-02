"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { RichTextEditor } from "./rich-text-editor"

// Match the Section interface from SectionEditor
interface Section {
  id: string
  type: string
  content: string
  order: number
  customName?: string
}

interface SectionEditorModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (section: Section) => Promise<void>
  section: Section | null
  isSaving?: boolean
}

export function SectionEditorModal({
  isOpen,
  onClose,
  onSave,
  section,
  isSaving = false
}: SectionEditorModalProps) {
  const [content, setContent] = useState("")
  const [customName, setCustomName] = useState("")
  const [sectionType, setSectionType] = useState("EXPERIENCE")
  const [internalIsSaving, setInternalIsSaving] = useState(false)
  const { toast } = useToast()

  // Update internal state when section changes
  useEffect(() => {
    if (section) {
      setContent(section.content || "")
      setCustomName(section.customName || "")
      setSectionType(section.type || "EXPERIENCE")
    }
  }, [section])

  const handleSave = async () => {
    if (!content.trim()) {
      toast({
        title: "Content required",
        description: "Please add some content before saving.",
        variant: "destructive",
      })
      return
    }

    // Use external saving state if provided, otherwise manage internally
    if (!isSaving) {
      setInternalIsSaving(true)
    }
    
    try {
      if (section) {
        await onSave({
          ...section,
          content,
          type: sectionType,
          customName: customName.trim() || undefined
        })
      }
      
      toast({
        title: "Section saved",
        description: "Your section has been saved successfully.",
      })
    } catch (error) {
      console.error("Error saving section:", error)
      toast({
        title: "Error saving section",
        description: "There was a problem saving your section. Please try again.",
        variant: "destructive",
      })
    } finally {
      if (!isSaving) {
        setInternalIsSaving(false)
      }
    }
  }

  // Determine if we should show the custom name field
  const showCustomNameField = sectionType === "CUSTOM"

  // Get the default section name based on type
  const getSectionName = () => {
    switch (sectionType) {
      case "EDUCATION":
        return "Education"
      case "EXPERIENCE":
        return "Experience"
      case "PROJECTS":
        return "Projects"
      case "CERTIFICATIONS":
        return "Certifications"
      case "SKILLS":
        return "Skills"
      case "CUSTOM":
        return "Custom Section"
      default:
        return "Section"
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{section?.id ? "Edit" : "Add"} {getSectionName()}</DialogTitle>
        </DialogHeader>

        <div className="mb-4">
          <Label htmlFor="section-type" className="mb-2 block">
            Section Type
          </Label>
          <Select
            value={sectionType}
            onValueChange={setSectionType}
          >
            <SelectTrigger id="section-type" className="w-full">
              <SelectValue placeholder="Select section type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="EXPERIENCE">Experience</SelectItem>
              <SelectItem value="EDUCATION">Education</SelectItem>
              <SelectItem value="PROJECTS">Projects</SelectItem>
              <SelectItem value="CERTIFICATIONS">Certifications</SelectItem>
              <SelectItem value="SKILLS">Skills</SelectItem>
              <SelectItem value="CUSTOM">Custom Section</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {showCustomNameField && (
          <div className="mb-4">
            <Label htmlFor="custom-name" className="mb-2 block">
              Section Name
            </Label>
            <Input
              id="custom-name"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="Enter a custom section name"
              className="w-full"
            />
          </div>
        )}

        <div className="mb-4">
          <Label htmlFor="content" className="mb-2 block">
            Content
          </Label>
          <RichTextEditor
            content={content}
            onChange={setContent}
            placeholder={`Add your ${getSectionName().toLowerCase()} details here...`}
            sectionType={sectionType.toLowerCase()}
          />
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={isSaving || internalIsSaving}
          >
            {isSaving || internalIsSaving ? "Saving..." : "Save"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}