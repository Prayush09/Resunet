"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Save, RefreshCw } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { Icons } from "@/components/icons"
import { ProfileImageUpdater } from "@/components/profile-image-updater"


const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters",
  }),
  twitter: z
    .string()
    .regex(/^@?[a-zA-Z0-9_]{1,15}$/, {
      message: "Please enter a valid Twitter/X username",
    })
    .optional()
    .or(z.literal("")),
  linkedin: z
    .string()
    .url({
      message: "Please enter a valid LinkedIn URL",
    })
    .optional()
    .or(z.literal("")),
  googleScholarUrl: z
    .string()
    .url({
      message: "Please enter a valid URL",
    })
    .optional()
    .or(z.literal("")),
  patentsToDisplay: z.coerce.number().int().min(0).max(20).optional(),
})

type FormData = z.infer<typeof formSchema>

interface ProfileFormProps {
  user: {
    id: string
    name: string
    email: string
    image?: string | null
    twitter?: string | null
    linkedin?: string | null
    googleScholarUrl?: string | null
    patentsToDisplay?: number | null
  }
}

export function ProfileForm({ user }: ProfileFormProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [isSaving, setIsSaving] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: user.name || "",
      twitter: user.twitter || "",
      linkedin: user.linkedin || "",
      googleScholarUrl: user.googleScholarUrl || "",
      patentsToDisplay: user.patentsToDisplay || 3,
    },
  })

  async function onSubmit(data: FormData) {
    setIsSaving(true)
    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Failed to update profile")
      }

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully",
      })
      router.refresh()
    } catch (error) {
      console.error("Profile update error:", error)
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  async function refreshPatents() {
    setIsRefreshing(true)
    try {
      const response = await fetch("/api/patents/refresh", {
        method: "POST",
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to refresh patents")
      }

      toast({
        title: "Patents refreshed",
        description: "Your patents have been refreshed successfully",
      })
      router.refresh()
    } catch (error: any) {
      console.error("Patent refresh error:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to refresh patents",
        variant: "destructive",
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Profile Image</CardTitle>
          <CardDescription>Update your profile image by uploading a photo or selecting an anime avatar</CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileImageUpdater />
        </CardContent>
      </Card>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="text-sm text-muted-foreground">
                Email: {user.email} <span className="text-xs">(cannot be changed)</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Social Media</CardTitle>
              <CardDescription>
                Connect your social media profiles to display on your resume
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="twitter"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Twitter/X Username</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="@username"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormDescription>Enter your Twitter/X username (e.g. @username)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="linkedin"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>LinkedIn Profile URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://linkedin.com/in/yourprofile"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormDescription>Enter the full URL to your LinkedIn profile</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Google Scholar Integration</CardTitle>
              <CardDescription>
                Connect your Google Scholar profile to display your patents in your resume
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="googleScholarUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Google Scholar Profile URL</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="https://scholar.google.com/citations?user=YOUR_ID"
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormDescription>Enter the full URL to your Google Scholar profile</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="patentsToDisplay"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Patents to Display</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} max={20} {...field} value={field.value || 0} />
                    </FormControl>
                    <FormDescription>How many patents do you want to display in your resume (0-20)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Separator className="my-4" />

              <div className="flex justify-between pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={refreshPatents}
                  disabled={isRefreshing || !form.getValues().googleScholarUrl}
                >
                  {isRefreshing ? (
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="mr-2 h-4 w-4" />
                  )}
                  Refresh Patents Now
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? (
                    <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </Form>
    </div>
  )
}