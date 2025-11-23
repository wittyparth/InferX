import { type NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export async function GET(
  request: NextRequest,
  { params }: { params: { provider: string } }
) {
  try {
    const provider = params.provider

    // Validate provider
    if (!['google', 'github'].includes(provider)) {
      return NextResponse.json(
        { error: "Invalid OAuth provider" },
        { status: 400 }
      )
    }

    // Redirect to backend OAuth endpoint
    const oauthUrl = `${BACKEND_URL}/api/v1/auth/oauth/${provider}`
    
    return NextResponse.redirect(oauthUrl)
  } catch (error) {
    console.error("OAuth initiation error:", error)
    return NextResponse.json(
      { error: "Failed to initiate OAuth" },
      { status: 500 }
    )
  }
}
