"use client"

import { useState } from "react"
import { Copy, Share2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"

interface ShareDialogProps {
  resumeId: string,
  open: boolean,
  onOpenChange: (isOpen: boolean) => void
}

export function ShareDialog({ resumeId }: ShareDialogProps) {
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  // Generate the shareable link
  const shareableLink = `${typeof window !== "undefined" ? window.location.origin : ""}/r/${resumeId}`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareableLink)
      setCopied(true)
      toast({
        title: "Link copied",
        description: "Resume link copied to clipboard",
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy link to clipboard",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          <Share2 className="mr-2 h-4 w-4" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share resume</DialogTitle>
          <DialogDescription>Anyone with this link will be able to view your resume.</DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2 mt-4">
          <div className="grid flex-1 gap-2">
            <Input readOnly value={shareableLink} className="w-full" />
          </div>
          <Button type="submit" size="sm" className="px-3" onClick={handleCopy}>
            <span className="sr-only">Copy</span>
            <Copy className="h-4 w-4" />
          </Button>
        </div>
        <DialogFooter className="sm:justify-start">
          <DialogDescription className="text-xs text-muted-foreground">
            This link will not expire unless you delete your resume.
          </DialogDescription>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
