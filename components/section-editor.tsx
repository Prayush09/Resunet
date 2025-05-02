"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"
import { Edit, Grip, Plus, Trash } from "lucide-react"
import { AnimatePresence, motion } from "framer-motion" // Import for animations

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { SectionEditorModal } from "@/components/section-editor-modal"
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog" // Import AlertDialog components

// Update the Section interface to include customName
interface Section {
  id: string
  type: string
  content: string
  order: number
  customName?: string
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
  
  // Add state for delete confirmation
  const [deletingSectionId, setDeletingSectionId] = useState<string | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)

  // Update sections when initialSections change
  useEffect(() => {
    setSections(initialSections)
  }, [initialSections])

  const handleOpenModal = (section?: Section) => {
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
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setTimeout(() => {
      setEditingSection(null)
    }, 300) // Wait for animation to complete
  }

  // Open delete confirmation dialog
  const handleOpenDeleteDialog = (id: string) => {
    setDeletingSectionId(id)
    setIsDeleteDialogOpen(true)
  }

  // Close delete confirmation dialog
  const handleCloseDeleteDialog = () => {
    setIsDeleteDialogOpen(false)
    setTimeout(() => {
      setDeletingSectionId(null)
    }, 300) // Wait for animation to complete
  }

  // Make sure the handleSaveSection function passes customName
  const handleSaveSection = async (section: Section) => {
    setIsSaving(true)
    try {
      let updatedSection: Section;
      
      if (section.id) {
        // Update existing section
        const response = await fetch(`/api/sections/${section.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            type: section.type,
            content: section.content,
            customName: section.customName,
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to update section")
        }
        
        updatedSection = await response.json()
        
        // Update local state immediately
        setSections(prevSections => 
          prevSections.map(s => s.id === section.id ? {...s, ...updatedSection} : s)
        )
      } else {
        // Create new section
        const response = await fetch("/api/sections", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            resumeId,
            type: section.type,
            content: section.content,
            order: sections.length,
            customName: section.customName,
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to create section")
        }
        
        updatedSection = await response.json()
        
        // Add new section to local state immediately
        setSections(prevSections => [...prevSections, updatedSection])
      }

      handleCloseModal()
      router.refresh()
      toast({
        title: section.id ? "Section updated" : "Section created",
        description: section.id ? "Your section has been updated" : "Your section has been created",
      })
    } catch (error) {
      console.error("Error saving section:", error)
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

      // Update local state immediately with animation
      setSections(prev => prev.filter(s => s.id !== id))
      
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
      handleCloseDeleteDialog()
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

    // Update local state immediately
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
      // Revert to original state if there's an error
      setSections(sections)
      
      toast({
        title: "Error",
        description: "Failed to reorder sections",
        variant: "destructive",
      })
      console.error("Error reordering sections:", error)
    }
  }

  const getSectionTitle = (section: Section) => {
    if (section.customName) {
      return section.customName
    }

    switch (section.type) {
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Resume Sections</h2>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="mr-2 h-4 w-4" />
          Add Section
        </Button>
      </div>

      {sections.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="text-center py-12 border rounded-lg bg-muted/50"
        >
          <h3 className="text-lg font-medium mb-2">No sections yet</h3>
          <p className="text-muted-foreground mb-4">
            Add sections to your resume to showcase your experience, education, and skills.
          </p>
          <Button onClick={() => handleOpenModal()}>
            <Plus className="mr-2 h-4 w-4" />
            Add Your First Section
          </Button>
        </motion.div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="sections">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                <AnimatePresence>
                  {sections.map((section, index) => (
                    <Draggable key={section.id} draggableId={section.id} index={index}>
                      {(provided) => (
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          <Card 
                            ref={provided.innerRef} 
                            {...provided.draggableProps} 
                            className="border"
                          >
                            <CardHeader className="flex flex-row items-center justify-between py-4">
                              <div className="flex items-center">
                                <div {...provided.dragHandleProps} className="mr-2 cursor-grab">
                                  <Grip className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <CardTitle className="text-lg">{getSectionTitle(section)}</CardTitle>
                              </div>
                            </CardHeader>
                            <CardContent className="pb-4">
                              <div className="prose prose-sm max-w-none">
                                <div dangerouslySetInnerHTML={{ __html: section.content }} />
                              </div>
                            </CardContent>
                            <CardFooter className="flex justify-end gap-2 pt-0">
                              <Button variant="outline" size="sm" onClick={() => handleOpenModal(section)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-destructive hover:text-destructive"
                                onClick={() => handleOpenDeleteDialog(section.id)}
                              >
                                <Trash className="mr-2 h-4 w-4" />
                                Delete
                              </Button>
                            </CardFooter>
                          </Card>
                        </motion.div>
                      )}
                    </Draggable>
                  ))}
                </AnimatePresence>
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
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this section from your resume. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCloseDeleteDialog}>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deletingSectionId && handleDeleteSection(deletingSectionId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}