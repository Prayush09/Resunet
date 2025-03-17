"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import { Edit, Grip, Plus, Trash } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Icons } from "@/components/icons"

interface Section {
  id: string
  type: string
  content: string
  order: number
}

interface SectionEditorProps {
  resumeId: string
  initialSections: Section[]
}

export function SectionEditor({ resumeId, initialSections }: SectionEditorProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [sections, setSections] = useState<Section[]>(initialSections)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSection, setEditingSection] = useState<Section | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const handleOpenDialog = (section?: Section) => {
    if (section) {
      setEditingSection(section)
    } else {
      setEditingSection({
        id: "",
        type: "EXPERIENCE",
        content: "",
        order: sections.length,
      })
    }
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingSection(null)
  }

  const handleSaveSection = async () => {
    if (!editingSection) return

    setIsSaving(true)
    try {
      if (editingSection.id) {
        // Update existing section
        const response = await fetch(`/api/sections/${editingSection.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: editingSection.type,
            content: editingSection.content,
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to update section")
        }

        setSections(sections.map((s) => (s.id === editingSection.id ? editingSection : s)))
      } else {
        // Create new section
        const response = await fetch("/api/sections", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            resumeId,
            type: editingSection.type,
            content: editingSection.content,
            order: editingSection.order,
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to create section")
        }

        const newSection = await response.json()
        setSections([...sections, newSection])
      }

      handleCloseDialog()
      toast({
        title: editingSection.id ? "Section updated" : "Section added",
        description: editingSection.id
          ? "Your section has been updated successfully"
          : "Your section has been added successfully",
      })
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save section",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteSection = async (id: string) => {
    try {
      const response = await fetch(`/api/sections/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete section")
      }

      setSections(sections.filter((s) => s.id !== id))
      toast({
        title: "Section deleted",
        description: "Your section has been deleted successfully",
      })
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete section",
        variant: "destructive",
      })
    }
  }

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return

    const items = Array.from(sections)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    const updatedSections = items.map((item, index) => ({
      ...item,
      order: index,
    }))

    setSections(updatedSections)

    try {
      const response = await fetch(`/api/resumes/${resumeId}/sections/reorder`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sections: updatedSections.map((s) => ({
            id: s.id,
            order: s.order,
          })),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to reorder sections")
      }

      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reorder sections",
        variant: "destructive",
      })
    }
  }

  const getSectionTypeName = (type: string) => {
    switch (type) {
      case "EDUCATION":
        return "Education"
      case "EXPERIENCE":
        return "Experience"
      case "SKILLS":
        return "Skills"
      case "PROJECTS":
        return "Projects"
      case "CERTIFICATIONS":
        return "Certifications"
      case "CUSTOM":
        return "Custom"
      default:
        return type
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Resume Sections</h2>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Add Section
        </Button>
      </div>

      {sections.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-muted/50">
          <h3 className="text-lg font-medium mb-2">No sections yet</h3>
          <p className="text-muted-foreground mb-4">
            Add sections to your resume to showcase your experience, education, and skills.
          </p>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            Add Your First Section
          </Button>
        </div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="sections">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                {sections.map((section, index) => (
                  <Draggable key={section.id} draggableId={section.id} index={index}>
                    {(provided) => (
                      <Card ref={provided.innerRef} {...provided.draggableProps} className="border">
                        <CardHeader className="flex flex-row items-center justify-between py-4">
                          <div className="flex items-center">
                            <div {...provided.dragHandleProps} className="mr-2 cursor-grab">
                              <Grip className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <CardTitle className="text-lg">{getSectionTypeName(section.type)}</CardTitle>
                          </div>
                        </CardHeader>
                        <CardContent className="pb-4">
                          <div className="prose prose-sm max-w-none">
                            <div
                              dangerouslySetInnerHTML={{
                                __html: section.content.split("\n").join("<br />"),
                              }}
                            />
                          </div>
                        </CardContent>
                        <CardFooter className="flex justify-end gap-2 pt-0">
                          <Button variant="outline" size="sm" onClick={() => handleOpenDialog(section)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleDeleteSection(section.id)}
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            Delete
                          </Button>
                        </CardFooter>
                      </Card>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingSection?.id ? "Edit Section" : "Add Section"}</DialogTitle>
            <DialogDescription>
              {editingSection?.id ? "Make changes to your section below." : "Add a new section to your resume."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="section-type" className="text-sm font-medium">
                Section Type
              </label>
              <Select
                value={editingSection?.type || "EXPERIENCE"}
                onValueChange={(value: any) => setEditingSection(editingSection ? { ...editingSection, type: value } : null)}
              >
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
            <div className="grid gap-2">
              <label htmlFor="section-content" className="text-sm font-medium">
                Content
              </label>
              <Textarea
                id="section-content"
                className="min-h-[200px]"
                placeholder="Enter section content..."
                value={editingSection?.content || ""}
                onChange={(e: { target: { value: any } }) =>
                  setEditingSection(editingSection ? { ...editingSection, content: e.target.value } : null)
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button onClick={handleSaveSection} disabled={isSaving}>
              {isSaving && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
              {editingSection?.id ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

