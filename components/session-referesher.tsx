"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { Icons } from "@/components/icons"
import { useToast } from "@/hooks/use-toast"

export function SessionRefresher() {
  const { data: session, status, update } = useSession()
  const [isRefreshing, setIsRefreshing] = useState(false)
  const { toast } = useToast()

  const refreshSession = async () => {
    setIsRefreshing(true)
    try {
      // Fetch the latest session data from the server
      const response = await fetch("/api/auth/session-check")
      if (!response.ok) throw new Error("Failed to refresh session")

      // Force a client-side session update
      await update()

      toast({
        title: "Session refreshed",
        description: "Your session has been refreshed with the latest data",
      })
    } catch (error) {
      console.error("Failed to refresh session:", error)
      toast({
        title: "Error",
        description: "Failed to refresh session",
        variant: "destructive",
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  // Auto-refresh session when component mounts
  useEffect(() => {
    if (status === "authenticated") {
      refreshSession()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  if (status !== "authenticated") return null

  return (
    <Button variant="outline" size="sm" onClick={refreshSession} disabled={isRefreshing}>
      {isRefreshing ? <Icons.spinner className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
      Refresh 
    </Button>
  )
}
