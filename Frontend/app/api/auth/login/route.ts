import { type NextRequest, NextResponse } from "next/server"

// Use BACKEND_API_URL for server-side requests (Docker network)
// Falls back to NEXT_PUBLIC_API_URL for local development
const BACKEND_URL = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 })
    }

    // Forward request to FastAPI backend
    const response = await fetch(`${BACKEND_URL}/api/v1/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { error: data.detail || "Login failed" },
        { status: response.status }
      )
    }

    // Return the access token and user data from backend
    return NextResponse.json({
      access_token: data.data.access_token,
      refresh_token: data.data.refresh_token,
      user: data.data.user,
    })
  } catch (error) {
    console.error("Login error:", error)
    console.error("BACKEND_URL:", BACKEND_URL)
    return NextResponse.json(
      { 
        error: "Unable to connect to authentication server",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    )
  }
}
