import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const error = searchParams.get("error")

  return NextResponse.json({
    error: error || "Unknown error",
    description: getErrorDescription(error),
  })
}

function getErrorDescription(error: string | null): string {
  switch (error) {
    case "Configuration":
      return "There is a problem with the server configuration."
    case "AccessDenied":
      return "You do not have access to sign in."
    case "Verification":
      return "The verification token has expired or has already been used."
    case "OAuthSignin":
    case "OAuthCallback":
    case "OAuthCreateAccount":
    case "EmailCreateAccount":
    case "Callback":
    case "OAuthAccountNotLinked":
    case "EmailSignin":
    case "CredentialsSignin":
      return "There was an error signing in with your credentials."
    default:
      return "An unexpected error occurred."
  }
}

