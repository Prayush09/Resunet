import { NextResponse } from "next/server"

export async function POST(request: Request) {
  // This is just a placeholder to prevent 404 errors
  // NextAuth uses this endpoint for logging
  return NextResponse.json({ success: true })
}

