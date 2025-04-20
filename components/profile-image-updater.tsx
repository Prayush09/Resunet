
//TODO: This image upload is not working, it's not even getting initiated.. Look into it
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { Icons } from "@/components/icons"

export function ProfileImageUpdater() {
  const { data: session, update } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [isUpdating, setIsUpdating] = useState(false)

  const handleUpdateImage = async () => {
    if (!session?.user) return

    setIsUpdating(true)
    try {
      // First, try to get the image from the session
      if (session.user.image) {
        const response = await fetch("/api/auth/update-profile", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            imageUrl: session.user.image,
          }),
        })

        if (!response.ok) {
          throw new Error("Failed to update profile image")
        }

        const data = await response.json()

        // Update the session
        await update({
          ...session,
          user: {
            ...session.user,
            image: data.user.image,
          },
        })

        toast({
          title: "Profile image updated",
          description: "Your profile image has been updated successfully",
        })

        router.refresh()
      } else {
        toast({
          title: "No image available",
          description: "No profile image found in your session",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Profile image update error:", error)
      toast({
        title: "Error",
        description: "Failed to update profile image",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="flex items-center gap-4">
      <Avatar className="h-16 w-16 border">
        <AvatarImage src={session?.user?.image || ""} alt={session?.user?.name || ""} referrerPolicy="no-referrer" />
        <AvatarFallback>{session?.user?.name?.charAt(0) || "IMG"}</AvatarFallback>
      </Avatar>
      <Button variant="outline" size="sm" onClick={handleUpdateImage} disabled={isUpdating}>
        {isUpdating ? <Icons.spinner className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
        Update Profile Image
      </Button>
    </div>
  )
}
