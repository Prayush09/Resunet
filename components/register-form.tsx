"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { signIn } from "next-auth/react"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Icons } from "@/components/icons"

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters",
  }),
  email: z.string().email({
    message: "Please enter a valid email address",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters",
  }),
})

type FormData = z.infer<typeof formSchema>

export function RegisterForm() {
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = React.useState<boolean>(false)
  const [isGoogleLoading, setIsGoogleLoading] = React.useState<boolean>(false)
  const [authError, setAuthError] = React.useState<string | null>(null)

  // Check for error parameter in URL
  React.useEffect(() => {
    const error = searchParams?.get("error")
    if (error) {
      setAuthError(error)
      toast({
        title: "Authentication Error",
        description: getErrorMessage(error),
        variant: "destructive",
      })
    }
  }, [searchParams, toast])

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  })

  async function onSubmit(data: FormData) {
    setIsLoading(true)
    setAuthError(null)

    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email.toLowerCase(),
          password: data.password,
        }),
      })

      if (!response.ok) {
        const { error } = await response.json()
        setAuthError(error || "unknown-error")
        toast({
          title: "Registration failed",
          description: error || "Your sign up request failed. Please try again.",
          variant: "destructive",
        })
        setIsLoading(false)
        return
      }

      toast({
        title: "Account created",
        description: "Your account has been created successfully.",
      })

      const signInResult = await signIn("credentials", {
        email: data.email.toLowerCase(),
        password: data.password,
        redirect: false,
        callbackUrl: "/dashboard",
      })

      if (signInResult?.ok) {
        router.push(signInResult.url || "/dashboard")
      } else {
        // If sign-in fails after registration, redirect to login page
        router.push("/login")
      }
    } catch (error) {
      console.error("Registration error:", error)
      toast({
        title: "Something went wrong",
        description: "Your sign up request failed. Please try again.",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    try {
      setIsGoogleLoading(true)
      setAuthError(null)

      // Directly use signIn without fetching providers first
      await signIn("google", {
        callbackUrl: "/dashboard",
      })
    } catch (error) {
      console.error("Google sign in error:", error)
      toast({
        title: "Google Sign In Failed",
        description: "There was an error signing in with Google. Please try again.",
        variant: "destructive",
      })
      setIsGoogleLoading(false)
    }
  }

  // Helper function to get user-friendly error messages
  function getErrorMessage(errorCode: string | null | undefined): string {
    switch (errorCode) {
      case "OAuthSignin":
        return "Error starting the OAuth sign-in flow."
      case "OAuthCallback":
        return "Error completing the OAuth sign-in."
      case "OAuthCreateAccount":
        return "Error creating a user with the OAuth provider."
      case "EmailCreateAccount":
        return "Error creating a user with the email provider."
      case "Callback":
        return "Error during the OAuth callback."
      case "OAuthAccountNotLinked":
        return "This email is already associated with another account."
      case "EmailSignin":
        return "Error sending the email sign-in link."
      case "CredentialsSignin":
        return "Invalid credentials. Please check your email and password."
      case "SessionRequired":
        return "You must be signed in to access this page."
      default:
        return "An unexpected error occurred. Please try again."
    }
  }

  return (
    <div className="grid gap-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="name@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading && <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />}
            Sign Up
          </Button>
        </form>
      </Form>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
        </div>
      </div>
      <Button variant="outline" type="button" disabled={isGoogleLoading} onClick={handleGoogleSignIn}>
        {isGoogleLoading ? (
          <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Icons.google className="mr-2 h-4 w-4" />
        )}{" "}
        Google
      </Button>

      {authError && <p className="text-sm text-destructive text-center">{getErrorMessage(authError)}</p>}
    </div>
  )
}

