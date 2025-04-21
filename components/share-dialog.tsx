"use client"

import { useState } from "react"
import { Copy, ExternalLink } from "lucide-react"


import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"

interface ShareDialogProps {
  resumeId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ShareDialog({ resumeId, open, onOpenChange }: ShareDialogProps) {
  const { toast } = useToast()
  const [copied, setCopied] = useState(false)
  const shareUrl = `${window.location.origin}/r/${resumeId}`

  const handleCopy = async () => {
    await navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    toast({
      title: "Link copied",
      description: "Resume link copied to clipboard",
    })
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Share Your Resume</DialogTitle>
          <DialogDescription>
            Share this link with recruiters or potential employers. This link will always show the latest version of
            your resume.
          </DialogDescription>
        </DialogHeader>
        <div className="flex items-center space-x-2 mt-4">
          <Input readOnly value={shareUrl} className="flex-1" />
          <Button size="icon" onClick={handleCopy}>
            <Copy className="h-4 w-4" />
          </Button>
        </div>
        <DialogFooter className="mt-4">
          <Button variant="outline" asChild>
            <a href={shareUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              Open Preview
            </a>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

