import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { ArrowLeft } from "lucide-react"
import { authOptions } from "@/lib/auth"
import { RegisterForm } from "@/components/register-form"

export const metadata: Metadata = {
  title: "Create an account",
  description: "Create an account to get started",
}

export default async function RegisterPage() {
  const session = await getServerSession(authOptions)
  
  if (session) {
    redirect("/dashboard")
  }
  
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-background px-4">
      {/* Circular back button with fixed position */}
      <div className="absolute top-4 left-4 z-10">
        <Link 
          href="/" 
          className="flex h-10 w-10 items-center justify-center rounded-full bg-background border shadow-sm hover:bg-accent transition-colors"
          aria-label="Back to home"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
      </div>
      
      <div className="w-full max-w-md rounded-lg border p-6 shadow-lg">
        <div className="text-center">
          <h1 className="text-2xl font-bold tracking-tight">Create an Account</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Enter your email below to create your account
          </p>
        </div>
        <RegisterForm />
        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="text-primary font-medium hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  )
}