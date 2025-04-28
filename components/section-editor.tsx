"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import { Edit, Grip, Loader2, Plus, Trash } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { SectionEditorModal } from "@/components/section-editor-modal"

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
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSection, setEditingSection] = useState<Section | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [deletingSectionId, setDeletingSectionId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [loadingEditId, setLoadingEditId] = useState<string | null>(null)

  const handleOpenModal = (section?: Section) => {
    if (section) {
      setEditingSection(section)
      setLoadingEditId(null)
    } else {
      setEditingSection({
        id: "",
        type: "EXPERIENCE",
        content: "",
        order: sections.length,
      })
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setTimeout(() => {
      setEditingSection(null)
    }, 300) // Wait for animation to complete
  }

  const handleSaveSection = async (sectionData: Section) => {
    setIsSaving(true)
    try {
      if (sectionData.id) {
        // Update existing section
        const response = await fetch(`/api/sections/${sectionData.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: sectionData.type,
            content: sectionData.content,
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to update section")
        }

        setSections(sections.map((s) => (s.id === sectionData.id ? sectionData : s)))
      } else {
        // Create new section
        const response = await fetch("/api/sections", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            resumeId,
            type: sectionData.type,
            content: sectionData.content,
            order: sectionData.order,
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to create section")
        }

        const newSection = await response.json()
        setSections([...sections, newSection])
      }

      handleCloseModal()
      toast({
        title: sectionData.id ? "Section updated" : "Section added",
        description: sectionData.id
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
      console.error("Error saving section:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleEditClick = (section: Section) => {
    setLoadingEditId(section.id)
    setTimeout(() => {
      handleOpenModal(section)
    }, 300) // Simulate a brief loading time for the edit operation
  }

  const confirmDelete = (id: string) => {
    setDeletingSectionId(id)
  }

  const handleDeleteSection = async () => {
    if (!deletingSectionId) return
    
    setIsDeleting(true)
    try {
      const response = await fetch(`/api/sections/${deletingSectionId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete section")
      }

      setSections(sections.filter((s) => s.id !== deletingSectionId))
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
      console.error("Error deleting section:", error)
    } finally {
      setIsDeleting(false)
      setDeletingSectionId(null)
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
      console.error("Error reordering sections:", error)
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
        <Button onClick={() => handleOpenModal()}>
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
          <Button onClick={() => handleOpenModal()}>
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
                            <div dangerouslySetInnerHTML={{ __html: section.content }} />
                          </div>
                        </CardContent>
                        <CardFooter className="flex justify-end gap-2 pt-0">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleEditClick(section)}
                            disabled={loadingEditId === section.id}
                          >
                            {loadingEditId === section.id ? (
                              <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Loading...
                              </>
                            ) : (
                              <>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </>
                            )}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => confirmDelete(section.id)}
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

      <SectionEditorModal
        section={editingSection}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveSection}
        isSaving={isSaving}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingSectionId} onOpenChange={(open) => !open && setDeletingSectionId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure you want to delete this section?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the section and remove all its content from your resume.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteSection}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}