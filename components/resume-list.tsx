"use client"

import type React from "react"

import Link from "next/link"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { formatDistanceToNow } from "date-fns"
import { Calendar, Copy, Edit, ExternalLink, FileText, MoreHorizontal, Trash, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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
import { cn } from "@/lib/utils"

interface Resume {
  id: string
  title: string
  summary: string | null
  createdAt: Date
  updatedAt: Date
}

interface ResumeListProps {
  resumes: Resume[]
}

// Custom Badge component
function Badge({
  children,
  variant = "default",
  className,
}: {
  children: React.ReactNode
  variant?: "default" | "secondary" | "outline" | "destructive"
  className?: string
}) {
  const baseStyles = "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium"
  const variantStyles = {
    default: "bg-primary text-primary-foreground",
    secondary: "bg-secondary text-secondary-foreground",
    outline: "border border-input",
    destructive: "bg-destructive text-destructive-foreground",
  }

  return <span className={cn(baseStyles, variantStyles[variant], className)}>{children}</span>
}

export function ResumeList({ resumes }: ResumeListProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isCopying, setCopying] = useState<string | null>(null)
  const [loadingResumeId, setLoadingResumeId] = useState<string | null>(null)
  const [loadingViewId, setLoadingViewId] = useState<string | null>(null)

  const handleCopyLink = async (id: string) => {
    setCopying(id)
    try {
      // Use the current origin for the link
      const link = `${window.location.origin}/r/${id}`
      await navigator.clipboard.writeText(link)
      toast({
        title: "Link copied",
        description: "Resume link copied to clipboard",
      })
    } finally {
      setCopying(null)
    }
  }

  const handleDelete = async () => {
    if (!deleteId) return

    setIsDeleting(true)
    try {
      const response = await fetch(`/api/resumes/${deleteId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete resume")
      }

      router.refresh()
      toast({
        title: "Resume deleted",
        description: "Your resume has been deleted successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete resume",
        variant: "destructive",
      })
      console.error("Error deleting resume:", error)
    } finally {
      setIsDeleting(false)
      setDeleteId(null)
    }
  }

  const handleEdit = (id: string) => {
    setLoadingResumeId(id)
  }

  const handleView = (id: string) => {
    setLoadingViewId(id)
  }

  const truncateHtml = (html: string, maxLength: number = 120) => {
    if (!html) return '';
  
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;
    
    const textContent = tempDiv.textContent || tempDiv.innerText;
    
    if (textContent.length <= maxLength) {
      return html;
    }
  
    const truncatedText = textContent.substring(0, maxLength) + '...';
    
    return truncatedText;
  };

  const sortedResumes = [...resumes].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())

  return (
    <>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {sortedResumes.map((resume) => {
          const updatedDuration = formatDistanceToNow(new Date(resume.updatedAt), { addSuffix: true })
          const isRecent = updatedDuration.includes("less than") || updatedDuration.includes("minute")

          return (
            <Card key={resume.id} className="group overflow-hidden transition-all duration-300 hover:shadow-md h-64 flex flex-col">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-primary" />
                      <CardTitle className="line-clamp-1 text-lg">{resume.title}</CardTitle>
                    </div>
                    {isRecent && (
                      <Badge variant="default" className="mt-1 bg-primary/10 text-primary hover:bg-primary/20">
                        Recently updated
                      </Badge>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-70 transition-opacity group-hover:opacity-100"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">More options</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/resume/${resume.id}/edit`} className="flex items-center cursor-pointer">
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        onClick={() => handleCopyLink(resume.id)}
                        disabled={isCopying === resume.id}
                      >
                        {isCopying === resume.id ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Copy className="mr-2 h-4 w-4" />
                        )}
                        {isCopying === resume.id ? "Copying..." : "Copy Link"}
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => setDeleteId(resume.id)}
                      >
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="pb-3 flex-1 overflow-hidden">
                <div className="flex items-center text-xs text-muted-foreground mb-2">
                  <Calendar className="mr-1 h-3 w-3" />
                  <CardDescription className="text-xs">Updated {updatedDuration}</CardDescription>
                </div>
                <div className="h-16 overflow-hidden">
                  {resume.summary ? (
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {resume.summary.replace(/<[^>]*>/g, '')}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground italic">No summary provided</p>
                  )}
                </div>
              </CardContent>
              <CardFooter className="pt-0 mt-auto">
                <div className="flex w-full gap-2">
                  <Button 
                    variant="outline" 
                    asChild={loadingResumeId !== resume.id}
                    className="flex-1"
                    disabled={loadingResumeId === resume.id}
                    onClick={loadingResumeId !== resume.id ? () => handleEdit(resume.id) : undefined}
                  >
                    {loadingResumeId === resume.id ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <Link href={`/resume/${resume.id}/edit`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </Link>
                    )}
                  </Button>
                  <Button 
                    variant="default" 
                    asChild={loadingViewId !== resume.id}
                    className="flex-1"
                    disabled={loadingViewId === resume.id}
                    onClick={loadingViewId !== resume.id ? () => handleView(resume.id) : undefined}
                  >
                    {loadingViewId === resume.id ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <Link href={`/r/${resume.id}`} target="_blank">
                        <ExternalLink className="mr-2 h-4 w-4" />
                        View
                      </Link>
                    )}
                  </Button>
                </div>
              </CardFooter>
            </Card>
          )
        })}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your resume and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
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
    </>
  )
}