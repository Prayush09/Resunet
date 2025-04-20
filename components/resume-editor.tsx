"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Save, Share2, Layout } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { SectionEditor } from "@/components/section-editor"
import { SkillsEditor } from "@/components/skills-editor"
import { ShareDialog } from "@/components/share-dialog"
import { PatentsSection } from "@/components/patent-section"
import { ExternalLink } from "lucide-react"

const formSchema = z.object({
  title: z.string().min(1, {
    message: "Title is required",
  }),
  summary: z.string().optional(),
  template: z.string().default("classic"),
})

interface Resume {
  id: string
  title: string
  summary: string | null
  template: string
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
  userId: string
}

interface ResumeEditorProps {
  resume: Resume
}

export function ResumeEditor({ resume }: ResumeEditorProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isSaving, setIsSaving] = useState(false)
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("sections")

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: resume.title,
      summary: resume.summary || "",
      template: resume.template || "classic",
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
          template: values.template,
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
          <Button variant="outline" onClick={() => window.open(`/r/${resume.id}`)} >
            <ExternalLink className="mr-2 h-4 w-4" />
              Preview
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
          <div className="grid gap-6 md:grid-cols-2">
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
              name="template"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Resume Template</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a template" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="classic">Classic</SelectItem>
                      <SelectItem value="modern">Modern</SelectItem>
                      <SelectItem value="creative">Creative</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
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

      <div className="border rounded-md p-4 bg-muted/30">
        <div className="flex items-center gap-2 mb-4">
          <Layout className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-medium">Template Preview</h2>
        </div>
       
      </div>

      <Tabs defaultValue="sections" value={activeTab} onValueChange={setActiveTab} className="mt-8">
        <TabsList>
          <TabsTrigger value="sections">Sections</TabsTrigger>
          <TabsTrigger value="skills">Skills</TabsTrigger>
          <TabsTrigger value="patents">Patents</TabsTrigger>
        </TabsList>
        <TabsContent value="sections" className="mt-6">
          <SectionEditor resumeId={resume.id} initialSections={resume.sections} />
        </TabsContent>
        <TabsContent value="skills" className="mt-6">
          <SkillsEditor resumeId={resume.id} initialSkills={resume.skills} />
        </TabsContent>
        <TabsContent value="patents" className="mt-6">
          <PatentsSection userId={resume.userId} />
        </TabsContent>
      </Tabs>

      
      <ShareDialog resumeId={resume.id} open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen} />
    </div>
  )
}
