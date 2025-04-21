"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent } from "@/components/ui/collapsible"
import { ChevronDown, ChevronUp, RefreshCw } from "lucide-react"
import { Icons } from "@/components/icons"

export function SessionDebugger() {
  const { data: session, status, update } = useSession()
  const [isOpen, setIsOpen] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const refreshSession = async () => {
    setIsRefreshing(true)
    try {
      await update()
      console.log("Session refreshed")
    } catch (error) {
      console.error("Failed to refresh session:", error)
    } finally {
      setIsRefreshing(false)
    }
  }

  // Extract user data safely
  const user = session?.user || (session as any)?.session?.user

  return (
    <Card className="mt-4">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">Session Debugger</CardTitle>
        <CardDescription>
          Status: <span className="font-medium">{status}</span>
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 text-xs">
        <div className="flex justify-between">
          <Button size="sm" variant="outline" onClick={refreshSession} disabled={isRefreshing}>
            {isRefreshing ? (
              <Icons.spinner className="mr-2 h-3 w-3 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-3 w-3" />
            )}
            Refresh Session
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setIsOpen(!isOpen)}>
            {isOpen ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            {isOpen ? "Hide Details" : "Show Details"}
          </Button>
        </div>

        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CollapsibleContent>
            <div className="rounded-md bg-muted p-3 font-mono">
              <div className="mb-2">
                <strong>User:</strong> {user ? "Found" : "Not found"}
                {user && (
                  <ul className="ml-4 mt-1 space-y-1">
                    <li>ID: {user.id || "Not found"}</li>
                    <li>Name: {user.name || "Not found"}</li>
                    <li>Email: {user.email || "Not found"}</li>
                    <li>Image: {user.image ? "Present" : "Not found"}</li>
                  </ul>
                )}
              </div>
              <div>
                <strong>Raw Session Data:</strong>
                <pre className="mt-1 max-h-40 overflow-auto whitespace-pre-wrap break-all text-[10px]">
                  {JSON.stringify(session, null, 2)}
                </pre>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  )
}
