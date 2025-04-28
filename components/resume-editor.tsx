"use client"

import React from "react"
import { useState, useRef, useTransition } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Save, ExternalLink } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { SectionEditor } from "@/components/section-editor"
import { SkillsEditor } from "@/components/skills-editor"
import { ShareDialog } from "@/components/share-dialog"
import { PatentsSection } from "@/components/patent-section"
import { ResumeAIHelper } from "@/components/AIBot"
import { RichTextEditor } from "@/components/rich-text-editor"
import { Spinner } from "@/components/ui/spinner"
import { useResume, type Resume } from "@/contexts/resume-context"
import { useMediaQuery } from "@/hooks/use-media-query"
import { cn } from "@/lib/utils"

const formSchema = z.object({
  title: z.string().min(1, {
    message: "Title is required",
  }),
  summary: z.string().optional(),
  template: z.string().default("classic"),
})

interface ResumeEditorProps {
  initialResume: Resume
}

export function ResumeEditor({ initialResume }: ResumeEditorProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [isSaving, setIsSaving] = useState(false)
  const summaryRef = useRef<HTMLTextAreaElement>(null)
  const isDesktop = useMediaQuery("(min-width: 1024px)")

  // Use our resume context
  const { 
    resume, 
    activeTab, 
    setActiveTab, 
    updateResumeField 
  } = useResume()

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: initialResume.title,
      summary: initialResume.summary || "",
      template: initialResume.template || "classic",
    },
  })

  // Update form values when resume changes
  React.useEffect(() => {
    if (resume) {
      form.setValue("title", resume.title)
      form.setValue("summary", resume.summary || "")
      form.setValue("template", resume.template || "classic")
    }
  }, [resume, form])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsSaving(true)

      // Update title if changed
      if (values.title !== resume?.title) {
        await updateResumeField("title", values.title)
      }
      
      // Update summary if changed
      if (values.summary !== resume?.summary) {
        await updateResumeField("summary", values.summary)
      }
      
      // Update template if changed
      if (values.template !== resume?.template) {
        await updateResumeField("template", values.template)
      }
      
      startTransition(() => {
        router.refresh()
      })

      toast({
        title: "Changes saved",
        description: "Your resume has been updated successfully.",
      })
    } catch (error) {
      console.error("Error saving resume:", error)
      toast({
        title: "Error saving changes",
        description: "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Handler for when AI suggestions should be applied
  const handleSuggestionApply = (content: string, targetField?: string) => {
    // If a target field is specified, update that field
    if (targetField === "summary") {
      form.setValue("summary", content)
      if (summaryRef.current) {
        summaryRef.current.focus()
      }
      toast({
        title: "Summary updated",
        description: "The AI suggestion has been applied to your summary",
      })
    } else {
      // Otherwise, copy to clipboard and notify user
      navigator.clipboard.writeText(content)
      toast({
        title: "Copied to clipboard",
        description: "The AI suggestion has been copied to your clipboard",
      })
    }
  }

  if (!resume) return null

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={cn("space-y-6", isDesktop ? "pr-16" : "")}
    >
      <div className="flex items-center justify-between">
        <motion.h1 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-3xl font-bold tracking-tight"
        >
          Edit Resume
        </motion.h1>
        <div className="flex items-center gap-2">
          <ShareDialog resumeId={resume.id} open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen} />
          <Button 
            variant="outline" 
            onClick={() => window.open(`/r/${resume.id}`)}
            className="transition-transform hover:scale-105"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Preview
          </Button>
          <Button 
            onClick={form.handleSubmit(onSubmit)} 
            disabled={isSaving || isPending}
            className="relative overflow-hidden transition-transform hover:scale-105"
          >
            <AnimatePresence mode="wait">
              {(isSaving || isPending) ? (
                <motion.div
                  key="saving"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center"
                >
                  <Spinner className="mr-2" />
                  Saving...
                </motion.div>
              ) : (
                <motion.div
                  key="save"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center"
                >
                  <Save className="mr-2 h-4 w-4" />
                  Save
                </motion.div>
              )}
            </AnimatePresence>
          </Button>
        </div>
      </div>

      <Form {...form}>
        <form className="space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid gap-6 md:grid-cols-2"
          >
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Resume Title</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g. Software Developer Resume" 
                      {...field}
                      className="transition-all focus:scale-[1.02]" 
                    />
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
                      <SelectTrigger className="transition-all focus:scale-[1.02]">
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
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <FormField
              control={form.control}
              name="summary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Professional Summary</FormLabel>
                  <div className="space-y-2">
                    <FormControl>
                      <RichTextEditor
                        content={field.value || ""}
                        onChange={field.onChange}
                        sectionType="summary"
                      />
                    </FormControl>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </motion.div>
        </form>
      </Form>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Tabs defaultValue="sections" value={activeTab} onValueChange={setActiveTab} className="mt-8">
          <TabsList className="mb-2">
            <TabsTrigger value="sections">Sections</TabsTrigger>
            <TabsTrigger value="skills">Skills</TabsTrigger>
            <TabsTrigger value="patents">Patents</TabsTrigger>
          </TabsList>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.2 }}
            >
              <TabsContent value="sections" className="mt-6 relative">
                <SectionEditor 
                  resumeId={resume.id} 
                  initialSections={resume.sections} 
                />
              </TabsContent>
              <TabsContent value="skills" className="mt-6">
                <SkillsEditor 
                  resumeId={resume.id} 
                  initialSkills={resume.skills} 
                />
              </TabsContent>
              <TabsContent value="patents" className="mt-6">
                <PatentsSection />
              </TabsContent>
            </motion.div>
          </AnimatePresence>
        </Tabs>
      </motion.div>

      <ResumeAIHelper
        resumeData={{
          title: form.watch("title"),
          summary: form.watch("summary") ?? null,
          sections: resume.sections,
          skills: resume.skills,
        }}
        activeTab={activeTab}
        onSuggestionApply={handleSuggestionApply}
      />
    </motion.div>
  )
}