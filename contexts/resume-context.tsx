"use client"

import { createContext, useContext, useState, type ReactNode } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

// Define types for our state
export interface Section {
  id: string
  type: string
  content: string
  order: number
}

export interface Skill {
  id: string
  name: string
  proficiency: number
}

export interface Resume {
  id: string
  title: string
  summary: string | null
  template: string
  sections: Section[]
  skills: Skill[]
  userId: string
}

interface ResumeContextType {
  resume: Resume | null
  isLoading: boolean
  isSaving: boolean
  activeTab: string
  setActiveTab: (tab: string) => void
  updateResumeField: (field: string, value: any) => Promise<void>
  createSection: (type: string) => Promise<Section>
  updateSection: (id: string, data: Partial<Section>) => Promise<void>
  deleteSection: (id: string) => Promise<void>
  reorderSections: (sectionIds: string[]) => Promise<void>
  createSkill: (data: Omit<Skill, "id">) => Promise<Skill>
  updateSkill: (id: string, data: Partial<Skill>) => Promise<void>
  deleteSkill: (id: string) => Promise<void>
  refreshResume: () => Promise<void>
}

const ResumeContext = createContext<ResumeContextType | undefined>(undefined)

export function ResumeProvider({
  children,
  initialResume,
}: {
  children: ReactNode
  initialResume: Resume
}) {
  const router = useRouter()
  const { toast } = useToast()
  const [resume, setResume] = useState<Resume>(initialResume)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState("sections")

  // Refresh resume data
  const refreshResume = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/resumes/${resume.id}`)
      if (!response.ok) throw new Error("Failed to fetch resume")
      const data = await response.json()
      setResume(data)
    } catch (error) {
      console.error("Error refreshing resume:", error)
      toast({
        title: "Error",
        description: "Failed to refresh resume data",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Update resume field (title, summary, template)
  const updateResumeField = async (field: string, value: any) => {
    try {
      setIsSaving(true)

      // Optimistic update
      setResume((prev) => ({
        ...prev!,
        [field]: value,
      }))

      const response = await fetch(`/api/resumes/${resume.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          [field]: value,
        }),
      })

      if (!response.ok) {
        throw new Error(`Failed to update ${field}`)
      }

      router.refresh()
      toast({
        title: "Updated",
        description: `${field.charAt(0).toUpperCase() + field.slice(1)} updated successfully`,
      })
    } catch (error) {
      console.error(`Error updating ${field}:`, error)
      toast({
        title: "Error",
        description: `Failed to update ${field}`,
        variant: "destructive",
      })

      // Revert optimistic update on error
      await refreshResume()
    } finally {
      setIsSaving(false)
    }
  }

  // Create a new section
  const createSection = async (type: string): Promise<Section> => {
    try {
      setIsSaving(true)
      const response = await fetch("/api/sections", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resumeId: resume.id,
          type,
          content: "",
          order: resume.sections.length,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create section")
      }

      const newSection = await response.json()

      // Update local state
      setResume((prev) => ({
        ...prev!,
        sections: [...prev!.sections, newSection],
      }))

      router.refresh()
      toast({
        title: "Section added",
        description: `New ${type} section has been added`,
      })

      return newSection
    } catch (error) {
      console.error("Error creating section:", error)
      toast({
        title: "Error",
        description: "Failed to create section",
        variant: "destructive",
      })
      throw error
    } finally {
      setIsSaving(false)
    }
  }

  // Update a section
  const updateSection = async (id: string, data: Partial<Section>) => {
    try {
      setIsSaving(true)

      // Optimistic update
      setResume((prev) => ({
        ...prev!,
        sections: prev!.sections.map((section) => (section.id === id ? { ...section, ...data } : section)),
      }))

      const response = await fetch(`/api/sections/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Failed to update section")
      }

      router.refresh()
      toast({
        title: "Section updated",
        description: "Your section has been updated successfully",
      })
    } catch (error) {
      console.error("Error updating section:", error)
      toast({
        title: "Error",
        description: "Failed to update section",
        variant: "destructive",
      })

      // Revert optimistic update on error
      await refreshResume()
    } finally {
      setIsSaving(false)
    }
  }

  // Delete a section
  const deleteSection = async (id: string) => {
    try {
      setIsSaving(true)

      // Optimistic update
      setResume((prev) => ({
        ...prev!,
        sections: prev!.sections.filter((section) => section.id !== id),
      }))

      const response = await fetch(`/api/sections/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete section")
      }

      router.refresh()
      toast({
        title: "Section deleted",
        description: "Your section has been deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting section:", error)
      toast({
        title: "Error",
        description: "Failed to delete section",
        variant: "destructive",
      })

      // Revert optimistic update on error
      await refreshResume()
    } finally {
      setIsSaving(false)
    }
  }

  // Reorder sections
  const reorderSections = async (sectionIds: string[]) => {
    try {
      setIsSaving(true)

      // Create a map of id to new order
      const orderMap = sectionIds.reduce(
        (acc, id, index) => {
          acc[id] = index
          return acc
        },
        {} as Record<string, number>,
      )

      // Optimistic update
      setResume((prev) => ({
        ...prev!,
        sections: prev!.sections
          .map((section) => ({
            ...section,
            order: orderMap[section.id] !== undefined ? orderMap[section.id] : section.order,
          }))
          .sort((a, b) => a.order - b.order),
      }))

      const response = await fetch(`/api/resumes/${resume.id}/sections/reorder`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sections: sectionIds.map((id, index) => ({
            id,
            order: index,
          })),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to reorder sections")
      }

      router.refresh()
    } catch (error) {
      console.error("Error reordering sections:", error)
      toast({
        title: "Error",
        description: "Failed to reorder sections",
        variant: "destructive",
      })

      // Revert optimistic update on error
      await refreshResume()
    } finally {
      setIsSaving(false)
    }
  }

  // Create a new skill
  const createSkill = async (data: Omit<Skill, "id">): Promise<Skill> => {
    try {
      setIsSaving(true)
      const response = await fetch("/api/skills", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          resumeId: resume.id,
          name: data.name,
          proficiency: data.proficiency,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create skill")
      }

      const newSkill = await response.json()

      // Update local state
      setResume((prev) => ({
        ...prev!,
        skills: [...prev!.skills, newSkill],
      }))

      router.refresh()
      toast({
        title: "Skill added",
        description: "Your skill has been added successfully",
      })

      return newSkill
    } catch (error) {
      console.error("Error creating skill:", error)
      toast({
        title: "Error",
        description: "Failed to create skill",
        variant: "destructive",
      })
      throw error
    } finally {
      setIsSaving(false)
    }
  }

  // Update a skill
  const updateSkill = async (id: string, data: Partial<Skill>) => {
    try {
      setIsSaving(true)

      // Optimistic update
      setResume((prev) => ({
        ...prev!,
        skills: prev!.skills.map((skill) => (skill.id === id ? { ...skill, ...data } : skill)),
      }))

      const response = await fetch(`/api/skills/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Failed to update skill")
      }

      router.refresh()
      toast({
        title: "Skill updated",
        description: "Your skill has been updated successfully",
      })
    } catch (error) {
      console.error("Error updating skill:", error)
      toast({
        title: "Error",
        description: "Failed to update skill",
        variant: "destructive",
      })

      // Revert optimistic update on error
      await refreshResume()
    } finally {
      setIsSaving(false)
    }
  }

  // Delete a skill
  const deleteSkill = async (id: string) => {
    try {
      setIsSaving(true)

      // Optimistic update
      setResume((prev) => ({
        ...prev!,
        skills: prev!.skills.filter((skill) => skill.id !== id),
      }))

      const response = await fetch(`/api/skills/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete skill")
      }

      router.refresh()
      toast({
        title: "Skill deleted",
        description: "Your skill has been deleted successfully",
      })
    } catch (error) {
      console.error("Error deleting skill:", error)
      toast({
        title: "Error",
        description: "Failed to delete skill",
        variant: "destructive",
      })

      // Revert optimistic update on error
      await refreshResume()
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <ResumeContext.Provider
      value={{
        resume,
        isLoading,
        isSaving,
        activeTab,
        setActiveTab,
        updateResumeField,
        createSection,
        updateSection,
        deleteSection,
        reorderSections,
        createSkill,
        updateSkill,
        deleteSkill,
        refreshResume,
      }}
    >
      {children}
    </ResumeContext.Provider>
  )
}

export function useResume() {
  const context = useContext(ResumeContext)
  if (context === undefined) {
    throw new Error("useResume must be used within a ResumeProvider")
  }
  return context
}

//TODO: COMPLETE THE CONTEXT AND LOADING STATES V0
//TODO: Make the custom section add custom name to the section for display on resume
//TODO: add light and dark mode to the site
//TODO: Add mobile number to profile section

//TODO: FIX THE GOOGLE OAUTH WHEN USING SIGNUP WHEN ALREADY A SIGNED IN USER

//TODO: ADD PDF EXPORT FUNCTIONALITY AND DONE!!

//TODO: TEST ALL THE FUNCTIONALITY AND MAKE SURE IT WORKS AS EXPECTED