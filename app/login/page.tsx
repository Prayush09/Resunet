import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { ArrowLeft } from "lucide-react";
import { authOptions } from "@/lib/auth";
import { LoginForm } from "@/components/login-form";
import ParticlesBackground from "@/components/ui/particle-background";

export const metadata: Metadata = {
  title: "Login",
  description: "Login to your account",
};

export default async function LoginPage() {
  const session = await getServerSession(authOptions);
  
  // Redirect to dashboard if session exists
  if (session) {
    redirect("/dashboard");
  }
  
  return (
    <div className="flex min-h-screen relative items-center justify-center">
      <ParticlesBackground />

      <div className="absolute top-4 left-4 z-10">
        <Link 
          href="/" 
          className="flex h-10 w-10 items-center justify-center rounded-full bg-background border shadow-sm hover:bg-accent transition-colors"
          aria-label="Back to home"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
      </div>
      
      <div className="w-full max-w-md space-y-6 rounded-lg border p-6 shadow-lg bg-white bg-opacity-95">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Welcome Back</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Enter your email to sign in to your account
          </p>
        </div>
        <LoginForm />
        <p className="text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link href="/register" className="text-primary font-medium hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  );
}
