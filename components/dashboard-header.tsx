"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { signOut, useSession } from "next-auth/react"
import { FileText, LogOut, User } from "lucide-react"

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
  name: string
  email: string
  image: string
}

export function DashboardHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const { toast } = useToast()
  const { data: session, status } = useSession()
  const [mounted, setMounted] = useState(false)
  const [sesh, setSesh] = useState<SessionUser | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    console.log("Session status:", status)
    console.log("Session data:", session)

    if (status === "unauthenticated" && mounted) {
      toast({
        title: "Authentication required",
        description: "Please sign in to access this page",
      })
      router.push("/login")
    }

    // Safely extract user data
    //@ts-ignore
    if (status === "authenticated" && session?.session?.user) {
      //@ts-ignore
      setSesh(session.session.user as SessionUser)
    } else if (status === "authenticated" && session?.user) {
      setSesh(session.user as SessionUser)
    }
  }, [status, session])

  if (!mounted) return null

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href="/dashboard" className="flex items-center gap-2 font-bold">
            <FileText className="h-5 w-5" />
            <span>Resume Builder</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6 ml-6">
            <Link
              href="/dashboard"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === "/dashboard" ? "text-primary" : "text-muted-foreground"
              }`}
            >
              Dashboard
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-4">
          {status === "authenticated" && sesh ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={sesh.image} alt={sesh.name} />
                    <AvatarFallback>{sesh.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    {sesh.name && <p className="font-medium">{sesh.name}</p>}
                    {sesh.email && (
                      <p className="w-[200px] truncate text-sm text-muted-foreground">{sesh.email}</p>
                    )}
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile" className="cursor-pointer">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer"
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
            <Button variant="ghost" size="sm" disabled>
              Loading...
            </Button>
          ) : (
            <Link href="/login">
              <Button>Sign in</Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
