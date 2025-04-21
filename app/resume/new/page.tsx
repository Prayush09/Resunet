"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import dynamic from "next/dynamic"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { getSession } from "next-auth/react"

// Lazy load header
const DashboardHeader = dynamic(() => import("@/components/dashboard-header").then(mod => mod.DashboardHeader), {
  loading: () => <div className="h-16 flex items-center justify-center">Loading header...</div>,
  ssr: false,
})

export default function NewResumePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function createResume() {
      const session = await getSession()
      if (!session) {
        router.push("/login")
        return
      }

      try {
        const response = await fetch("/api/resumes", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: "Untitled Resume",
            template: "classic",
          }),
        })

        if (!response.ok) throw new Error("Resume creation failed")
        const data = await response.json()
        router.push(`/resume/${data.id}/edit`)
      } catch (error) {
        console.error("Error:", error)
        setLoading(false)
      }
    }

    createResume()
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="text-muted-foreground">Creating your resume...</p>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />
      <main className="flex-1 container mx-auto max-w-7xl px-4 py-10">
        <h1 className="text-3xl font-bold tracking-tight mb-8">Something went wrong. Please try again.</h1>
        <Button onClick={() => router.push("/")}>Go Home</Button>
      </main>
    </div>
  )
}
