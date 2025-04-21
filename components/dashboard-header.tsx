"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { LogOut, Settings } from "lucide-react"
import { GiNestEggs } from "react-icons/gi"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/hooks/use-toast"

type SessionUser = {
  id: string
  name?: string
  email?: string
  image?: string
}

export function DashboardHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()
  const { data: session, status } = useSession()
  const [mounted, setMounted] = useState(false)

  // Extract user data safely with more fallbacks
  const user =
    session?.user || (session as any)?.session?.user || ((session as any)?.data?.user as SessionUser | undefined)

  // Log session data in development
  if (process.env.NODE_ENV !== "production" && mounted) {
    console.log("Dashboard Header - Session Status:", status)
    console.log("Dashboard Header - Session Data:", session)
    console.log("Dashboard Header - Extracted User:", user)
  }

  useEffect(() => {
    setMounted(true)

    if (status === "unauthenticated" && mounted) {
      toast({
        title: "Authentication required",
        description: "Please sign in to access this page",
      })
      router.push("/login")
    }
  }, [status, mounted, router, toast])

  if (!mounted) return null

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto max-w-7xl h-16 px-4">
        <div className="flex h-full items-center justify-between">
          {/* Logo and Navigation */}
          <div className="flex items-center space-x-4">
            <Link href="/dashboard" className="flex items-center space-x-2 font-bold">
              <GiNestEggs className="h-5 w-5" />
              <span>Resunest</span>
            </Link>
          </div>

          {/* User Menu */}
          <div className="flex items-center space-x-4">
            <nav className="hidden md:flex">
              <Link
                href="/dashboard"
                className={`px-3 py-2 text-sm font-medium transition-colors hover:text-primary ${
                  pathname === "/dashboard" ? "hidden" : "text-muted-foreground"
                }`}
              >
                Dashboard
              </Link>
            </nav>
            {status === "authenticated" && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-9 w-9 rounded-full p-0 overflow-hidden" aria-label="User menu">
                    <Avatar className="h-full w-full">
                      <AvatarImage
                        src={user.image || ""}
                        alt={user.name || "User"}
                        referrerPolicy="no-referrer"
                        loading="eager"
                        className="object-cover"
                      />
                      <AvatarFallback>{user.name?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="p-2">
                    <div className="flex flex-col space-y-1 leading-none">
                      {user.name && <p className="font-medium">{user.name}</p>}
                      {user.email && <p className="w-full truncate text-sm text-muted-foreground">{user.email}</p>}
                    </div>
                  </div>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex w-full items-center cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Profile Settings</span>
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem
                    className="flex w-full items-center cursor-pointer"
                    onSelect={(event) => {
                      event.preventDefault()
                      signOut({
                        callbackUrl: `${window.location.origin}/login`,
                      })
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : status === "loading" ? (
              <Button variant="ghost" size="sm" disabled className="gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                <span>Loading</span>
              </Button>
            ) : (
              <Link href="/login">
                <Button size="sm">Sign in</Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
