"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Save, Share2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { SectionEditor } from "@/components/section-editor"
import { SkillsEditor } from "@/components/skills-editor"
import { ShareDialog } from "@/components/share-dialog"

const formSchema = z.object({
  title: z.string().min(1, {
    message: "Title is required",
  }),
  summary: z.string().optional(),
})

interface Resume {
  id: string
  title: string
  summary: string | null
  sections: {
    id: string
    type: string
    content: string
    order: number
  }[]
  skills: {
    id: string
    name: string
    proficiency: number
  }[]
}

interface ResumeEditorProps {
  resume: Resume
}

export function ResumeEditor({ resume }: ResumeEditorProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSaving, setIsSaving] = useState(false)
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: resume.title,
      summary: resume.summary || "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSaving(true)
    try {
      const response = await fetch(`/api/resumes/${resume.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: values.title,
          summary: values.summary,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update resume")
      }

      router.refresh()
      toast({
        title: "Resume updated",
        description: "Your resume has been saved successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save resume",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Edit Resume</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => setIsShareDialogOpen(true)}>
            <Share2 className="mr-2 h-4 w-4" />
            Share
          </Button>
          <Button onClick={form.handleSubmit(onSubmit)} disabled={isSaving}>
            {isSaving ? (
              <>Saving...</>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save
              </>
            )}
          </Button>
        </div>
      </div>

      <Form {...form}>
        <form className="space-y-8">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Resume Title</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Software Developer Resume" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="summary"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Professional Summary</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Write a brief summary of your professional background and key qualifications..."
                    className="min-h-[100px]"
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>

      <Tabs defaultValue="sections" className="mt-8">
        <TabsList>
          <TabsTrigger value="sections">Sections</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
        </TabsList>
        <TabsContent value="sections" className="mt-6">
          <SectionEditor resumeId={resume.id} initialSections={resume.sections} />
        </TabsContent>
        <TabsContent value="skills" className="mt-6">
          <SkillsEditor resumeId={resume.id} initialSkills={resume.skills} />
        </TabsContent>
      </Tabs>

      <ShareDialog resumeId={resume.id} open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen} />
    </div>
  )
}

