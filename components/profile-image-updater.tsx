"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Upload, RefreshCw, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"
import { Icons } from "@/components/icons"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { SessionRefresher } from "@/components/session-referesher"

// Anime avatar options
const animeAvatars = [
  {
    url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTjmU_J0ecRIq0xLXpQVbi11khgmUBU3MvNPQ&s",
    alt: "Anime Avatar 1",
  },
  {
    url: "https://live.staticflickr.com/65535/51770807081_90dcafbd15_z.jpg",
    alt: "Anime Avatar 2",
  },
  {
    url: "https://i1.sndcdn.com/avatars-ntrMyG6Yc2uzjIHM-kwhOkA-t500x500.jpg",
    alt: "Anime Avatar 3",
  },
  {
    url: "https://wallpapers-clan.com/wp-content/uploads/2022/09/attack-on-titan-eren-pfp-15.jpg",
    alt: "Anime Avatar 4",
  },
  {
    url: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcREzXxqYY5t52rnb7Fkb68sPhLRtvJUPUt0gVemv6nuiXxfHpaYEveGtCGtmQpe8_sy2LE&usqp=CAU",
    alt: "Anime Avatar 5",
  },
]

export function ProfileImageUpdater() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { toast } = useToast()
  const [isUpdating, setIsUpdating] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<string>("upload")
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Create a local preview when the file state changes
  useEffect(() => {
    if (!file) {
      if (!selectedAvatar) {
        setPreviewUrl(null)
      }
      return
    }

    // Clean up any previous object URL
    if (previewUrl && !previewUrl.startsWith("http")) {
      URL.revokeObjectURL(previewUrl)
    }

    const url = URL.createObjectURL(file)
    setPreviewUrl(url)
    setSelectedAvatar(null) // Clear selected avatar when file is chosen

    return () => {
      if (url && !url.startsWith("http")) {
        URL.revokeObjectURL(url)
      }
    }
  }, [file])

  // Set preview URL when an avatar is selected
  useEffect(() => {
    if (selectedAvatar) {
      setPreviewUrl(selectedAvatar)
      setFile(null) // Clear file when avatar is chosen
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }, [selectedAvatar])

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0] ?? null
    if (selected) {
      // Validate file type and size
      if (!selected.type.startsWith("image/")) {
        toast({
          title: "Invalid file type",
          description: "Please select an image file",
          variant: "destructive",
        })
        return
      }

      // 5MB max size
      if (selected.size > 5 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Please select an image smaller than 5MB",
          variant: "destructive",
        })
        return
      }

      setFile(selected)
    }
  }

  // Convert file to Base64 string
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        if (typeof reader.result === "string") {
          resolve(reader.result)
        } else {
          reject(new Error("Failed to read file"))
        }
      }
      reader.onerror = () => reject(reader.error)
    })
  }

  // Handle avatar selection
  const handleAvatarSelect = (url: string) => {
    setSelectedAvatar(url)
  }

  const handleUpdateImage = async () => {
    // Check for session in multiple ways to ensure we catch it
    const sessionUser = session?.user || (session as any)?.session?.user || (session as any)?.data?.user
    if (!sessionUser) {
      console.log("Session data:", session)
      toast({
        title: "Not logged in",
        description: "You must be logged in to update your profile",
        variant: "destructive",
      })
      return
    }

    if (!previewUrl) {
      toast({
        title: "No image selected",
        description: "Please choose an image before uploading",
        variant: "destructive",
      })
      return
    }

    setIsUpdating(true)
    try {
      let imageData: string

      // If we have a file, convert it to base64
      if (file) {
        imageData = await fileToBase64(file)
      }
      // Otherwise use the selected avatar URL
      else if (selectedAvatar) {
        imageData = selectedAvatar
      } else {
        throw new Error("No image data available")
      }

      // Send to backend
      const response = await fetch("/api/auth/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: selectedAvatar, // Send URL directly if it's an avatar
          imageBase64: file ? imageData : null, // Only send base64 if it's a file upload
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to update profile image")
      }

      const data = await response.json()

      // Don't try to update the session directly - instead, force a refresh
      toast({
        title: "Profile image updated",
        description: "Your profile image has been updated successfully",
      })

      setFile(null)
      if (fileInputRef.current) fileInputRef.current.value = ""

      router.refresh()
    } catch (error) {
      console.error("Profile image update error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update profile image",
        variant: "destructive",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleClearSelection = () => {
    setFile(null)
    setSelectedAvatar(null)
    setPreviewUrl(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Avatar className="h-24 w-24 border">
          <AvatarImage
            src={previewUrl || session?.user?.image || ""}
            alt={session?.user?.name || ""}
            referrerPolicy="no-referrer"
          />
          <AvatarFallback>{session?.user?.name?.charAt(0) || "U"}</AvatarFallback>
        </Avatar>

        <div className="space-y-2">
          <h3 className="text-sm font-medium">Preview</h3>
          {previewUrl && (
            <Button variant="outline" size="sm" onClick={handleClearSelection} className="h-8">
              <X className="mr-2 h-3 w-3" />
              Clear
            </Button>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload">Upload Image</TabsTrigger>
          <TabsTrigger value="avatars">Anime Avatars</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-4">
          <div className="flex flex-col space-y-4">
            <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleFileChange} />

            <Button variant="outline" onClick={() => fileInputRef.current?.click()} className="w-full">
              <Upload className="mr-2 h-4 w-4" />
              {file ? "Change Image" : "Select Image"}
            </Button>

            <p className="text-xs text-muted-foreground">Select an image file (JPG, PNG, GIF) up to 5MB in size.</p>
          </div>
        </TabsContent>

        <TabsContent value="avatars">
          <div className="grid grid-cols-3 gap-3">
            {animeAvatars.map((avatar, index) => (
              <Card
                key={index}
                className={`cursor-pointer overflow-hidden transition-all ${
                  selectedAvatar === avatar.url ? "ring-2 ring-primary" : "hover:ring-1 hover:ring-primary/50"
                }`}
                onClick={() => handleAvatarSelect(avatar.url)}
              >
                <CardContent className="p-2">
                  <div className="relative aspect-square overflow-hidden rounded-md">
                    <img
                      src={avatar.url || "/placeholder.svg"}
                      alt={avatar.alt}
                      className="h-full w-full object-cover"
                    />
                    {selectedAvatar === avatar.url && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                        <Check className="h-6 w-6 text-white" />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <Separator />

      <div className="flex justify-end space-x-2">
        <Button onClick={handleUpdateImage} disabled={isUpdating || (!file && !selectedAvatar)}>
          {isUpdating ? (
            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          Update Profile Image
        </Button>
        <SessionRefresher  /> {/* Only show on larger screens */}
      </div>
    </div>
  )
}
