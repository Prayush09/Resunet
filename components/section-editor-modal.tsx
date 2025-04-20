"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RichTextEditor } from "@/components/rich-text-editor"
import { Icons } from "@/components/icons"

interface Section {
  id: string
  type: string
  content: string
  order: number
}

interface SectionEditorModalProps {
  section: Section | null
  isOpen: boolean
  onClose: () => void
  onSave: (section: Section) => Promise<void>
  isSaving: boolean
}

export function SectionEditorModal({ section, isOpen, onClose, onSave, isSaving }: SectionEditorModalProps) {
  const [editedSection, setEditedSection] = useState<Section | null>(null)

  useEffect(() => {
    if (section) {
      setEditedSection(section)
    }
  }, [section])

  const handleContentChange = (content: string) => {
    if (editedSection) {
      setEditedSection({ ...editedSection, content })
    }
  }

  const handleTypeChange = (type: string) => {
    if (editedSection) {
      setEditedSection({ ...editedSection, type })
    }
  }

  const handleSave = async () => {
    if (editedSection) {
      await onSave(editedSection)
    }
  }

  if (!editedSection) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: "spring", duration: 0.35 }}
            className="relative z-50 w-full max-w-3xl max-h-[85vh] overflow-auto rounded-lg border bg-background shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b p-4">
              <h2 className="text-xl font-semibold">{editedSection.id ? "Edit Section" : "Add Section"}</h2>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="p-4 space-y-4">
              <div className="space-y-2">
                <label htmlFor="section-type" className="text-sm font-medium">
                  Section Type
                </label>
                <Select value={editedSection.type} onValueChange={handleTypeChange}>
                  <SelectTrigger id="section-type">
                    <SelectValue placeholder="Select section type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EDUCATION">Education</SelectItem>
                    <SelectItem value="EXPERIENCE">Experience</SelectItem>
                    <SelectItem value="SKILLS">Skills</SelectItem>
                    <SelectItem value="PROJECTS">Projects</SelectItem>
                    <SelectItem value="CERTIFICATIONS">Certifications</SelectItem>
                    <SelectItem value="CUSTOM">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label htmlFor="section-content" className="text-sm font-medium">
                  Content
                </label>
                <RichTextEditor
                  content={editedSection.content}
                  onChange={handleContentChange}
                  placeholder="Enter section content..."
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t p-4">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
                {editedSection.id ? "Update" : "Add"}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
