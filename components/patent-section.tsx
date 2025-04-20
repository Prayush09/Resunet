"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { RefreshCw, ExternalLink } from 'lucide-react'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Icons } from "@/components/icons"

interface Patent {
  id: string
  title: string
  authors: string
  publicationDate: string | null
  patentNumber: string | null
  abstract: string | null
  url: string | null
  citations: number | null
}

interface PatentsSectionProps {
  userId: string
}

export function PatentsSection({ userId }: PatentsSectionProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [patents, setPatents] = useState<Patent[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [userSettings, setUserSettings] = useState<{
    googleScholarUrl: string | null
    patentsToDisplay: number
  }>({
    googleScholarUrl: null,
    patentsToDisplay: 3
  })

  useEffect(() => {
    fetchPatents()
  }, [])

  async function fetchPatents() {
    setLoading(true)
    try {
      const response = await fetch("/api/patents")
      
      if (!response.ok) {
        throw new Error("Failed to fetch patents")
      }
      
      const data = await response.json()
      setPatents(data.patents || [])
      setUserSettings({
        googleScholarUrl: data.googleScholarUrl,
        patentsToDisplay: data.patentsToDisplay || 3
      })
    } catch (error) {
      console.error("Error fetching patents:", error)
      toast({
        title: "Error",
        description: "Failed to load patents",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  async function refreshPatents() {
    if (!userSettings.googleScholarUrl) {
      toast({
        title: "Google Scholar not connected",
        description: "Please set your Google Scholar URL in your profile settings",
        variant: "destructive",
      })
      return
    }

    setRefreshing(true)
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
      
      // Refetch patents to update the list
      await fetchPatents()
      router.refresh()
    } catch (error: any) {
      console.error("Patent refresh error:", error)
      toast({
        title: "Error",
        description: error.message || "Failed to refresh patents",
        variant: "destructive",
      })
    } finally {
      setRefreshing(false)
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <Icons.spinner className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Patents from Google Scholar</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {userSettings.googleScholarUrl 
              ? `Displaying ${Math.min(patents.length, userSettings.patentsToDisplay)} of ${patents.length} patents` 
              : "Connect your Google Scholar profile to display patents"}
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={refreshPatents} 
          disabled={refreshing || !userSettings.googleScholarUrl}
        >
          {refreshing ? (
            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="mr-2 h-4 w-4" />
          )}
          Refresh
        </Button>
      </div>

      {!userSettings.googleScholarUrl ? (
        <Card className="border-dashed">
          <CardContent className="pt-6 text-center">
            <p className="mb-4 text-muted-foreground">
              You haven't connected your Google Scholar profile yet.
            </p>
            <Button onClick={() => router.push("/profile")}>
              Go to Profile Settings
            </Button>
          </CardContent>
        </Card>
      ) : patents.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="pt-6 text-center">
            <p className="mb-2 text-muted-foreground">
              No patents found in your Google Scholar profile.
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Make sure your Google Scholar profile contains patents and try refreshing.
            </p>
            <Button variant="outline" onClick={refreshPatents} disabled={refreshing}>
              {refreshing ? (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 h-4 w-4" />
              )}
              Refresh Patents
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {patents.slice(0, userSettings.patentsToDisplay).map((patent) => (
            <Card key={patent.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-medium">{patent.title}</CardTitle>
                <CardDescription>{patent.authors}</CardDescription>
              </CardHeader>
              <CardContent className="pb-2">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {patent.patentNumber && (
                    <div>
                      <span className="font-medium">Patent Number:</span> {patent.patentNumber}
                    </div>
                  )}
                  {patent.publicationDate && (
                    <div>
                      <span className="font-medium">Published:</span> {patent.publicationDate}
                    </div>
                  )}
                  {patent.citations !== null && (
                    <div>
                      <span className="font-medium">Citations:</span> {patent.citations}
                    </div>
                  )}
                </div>
                {patent.abstract && (
                  <div className="mt-2 text-sm text-muted-foreground">
                    {patent.abstract}
                  </div>
                )}
              </CardContent>
              {patent.url && (
                <CardFooter className="pt-0">
                  <Button variant="ghost" size="sm" className="ml-auto" asChild>
                    <a href={patent.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View on Google Scholar
                    </a>
                  </Button>
                </CardFooter>
              )}
            </Card>
          ))}
        </div>
      )}

      {patents.length > 0 && (
        <div className="text-center text-sm text-muted-foreground">
          <p>
            Patents are automatically included in your resume. You can change how many patents to display in your{" "}
            <Button variant="link" className="p-0 h-auto" onClick={() => router.push("/profile")}>
              profile settings
            </Button>.
          </p>
        </div>
      )}
    </div>
  )
}
