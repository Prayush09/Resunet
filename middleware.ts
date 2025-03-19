import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Get the token from the request
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  // Check if the user is authenticated
  const isAuthenticated = !!token

  // Define protected routes
  const protectedRoutes = ["/dashboard", "/resume"]
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))

  // Define auth routes
  const authRoutes = ["/login", "/register"]
  const isAuthRoute = authRoutes.some((route) => pathname === route)

  // Redirect logic
  if (isProtectedRoute && !isAuthenticated) {
    // Redirect to login if trying to access protected route without authentication
    const url = new URL("/login", request.url)
    url.searchParams.set("from", pathname)
    return NextResponse.redirect(url)
  }

  if (isAuthRoute && isAuthenticated) {
    // Redirect to dashboard if trying to access auth routes while authenticated
    return NextResponse.redirect(new URL("/dashboard", request.url))
  }

  return NextResponse.next()
}

// Configure the middleware to run on specific paths
export const config = {
  matcher: [
    // Match all routes except for static files, api routes, and _next
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}

