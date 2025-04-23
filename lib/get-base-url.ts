/**
 * Returns the base URL for the application
 * Uses NEXTAUTH_URL in production or window.location.origin in development
 */
export function getBaseUrl(): string {
    if (typeof window !== "undefined") {
      // Client-side
      return process.env.NEXT_PUBLIC_NODE_ENV === "production"
        ? "https://resunest.prayushgiri.com"
        : window.location.origin
    }
  
    // Server-side
    return process.env.NEXTAUTH_URL || "https://resunest.prayushgiri.com"
  }
  