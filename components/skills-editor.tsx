"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Trash } from "lucide-react"

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
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { useToast } from "@/hooks/use-toast"
import { Icons } from "@/components/icons"

interface Skill {
  id: string
  name: string
  proficiency: number
}

interface SkillsEditorProps {
  resumeId: string
  initialSkills: Skill[]
}

export function SkillsEditor({ resumeId, initialSkills }: SkillsEditorProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [skills, setSkills] = useState<Skill[]>(initialSkills)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingSkill, setEditingSkill] = useState<Skill | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const handleOpenDialog = (skill?: Skill) => {
    if (skill) {
      setEditingSkill(skill)
    } else {
      setEditingSkill({
        id: "",
        name: "",
        proficiency: 70,
      })
    }
    setIsDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setIsDialogOpen(false)
    setEditingSkill(null)
  }

  const handleSaveSkill = async () => {
    if (!editingSkill || !editingSkill.name.trim()) {
      toast({
        title: "Error",
        description: "Skill name is required",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    try {
      if (editingSkill.id) {
        // Update existing skill
        const response = await fetch(`/api/skills/${editingSkill.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: editingSkill.name,
            proficiency: editingSkill.proficiency,
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to update skill")
        }

        setSkills(skills.map((s) => (s.id === editingSkill.id ? editingSkill : s)))
      } else {
        // Create new skill
        const response = await fetch("/api/skills", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            resumeId,
            name: editingSkill.name,
            proficiency: editingSkill.proficiency,
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to create skill")
        }

        const newSkill = await response.json()
        setSkills([...skills, newSkill])
      }

      handleCloseDialog()
      toast({
        title: editingSkill.id ? "Skill updated" : "Skill added",
        description: editingSkill.id
          ? "Your skill has been updated successfully"
          : "Your skill has been added successfully",
      })
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save skill",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteSkill = async (id: string) => {
    try {
      const response = await fetch(`/api/skills/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete skill")
      }

      setSkills(skills.filter((s) => s.id !== id))
      toast({
        title: "Skill deleted",
        description: "Your skill has been deleted successfully",
      })
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete skill",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Skills</h2>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="mr-2 h-4 w-4" />
          Add Skill
        </Button>
      </div>

      {skills.length === 0 ? (
        <div className="text-center py-12 border rounded-lg bg-muted/50">
          <h3 className="text-lg font-medium mb-2">No skills yet</h3>
          <p className="text-muted-foreground mb-4">Add skills to showcase your expertise and proficiency levels.</p>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="mr-2 h-4 w-4" />
            Add Your First Skill
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {skills.map((skill) => (
            <Card key={skill.id} className="border">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{skill.name}</CardTitle>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-full bg-muted rounded-full h-2.5">
                    <div className="bg-primary h-2.5 rounded-full" style={{ width: `${skill.proficiency}%` }}></div>
                  </div>
                  <span className="text-sm font-medium">{skill.proficiency}%</span>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => handleOpenDialog(skill)}>
                  Edit
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => handleDeleteSkill(skill.id)}
                >
                  <Trash className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingSkill?.id ? "Edit Skill" : "Add Skill"}</DialogTitle>
            <DialogDescription>
              {editingSkill?.id ? "Make changes to your skill below." : "Add a new skill to your resume."}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="skill-name" className="text-sm font-medium">
                Skill Name
              </label>
              <Input
                id="skill-name"
                placeholder="e.g. JavaScript, Project Management, etc."
                value={editingSkill?.name || ""}
                onChange={(e) => setEditingSkill(editingSkill ? { ...editingSkill, name: e.target.value } : null)}
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="skill-proficiency" className="text-sm font-medium">
                Proficiency: {editingSkill?.proficiency || 70}%
              </label>
              <Slider
                id="skill-proficiency"
                min={0}
                max={100}
                step={5}
                value={[editingSkill?.proficiency || 70]}
                onValueChange={(value) =>
                  setEditingSkill(editingSkill ? { ...editingSkill, proficiency: value[0] } : null)
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Cancel
            </Button>
            <Button onClick={handleSaveSkill} disabled={isSaving}>
              {isSaving && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
              {editingSkill?.id ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

