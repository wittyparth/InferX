import { type NextRequest, NextResponse } from "next/server"

const BACKEND_URL = process.env.BACKEND_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

export async function GET(
  request: NextRequest,
  { params }: { params: { provider: string } }
) {
  try {
    const provider = params.provider
    const searchParams = request.nextUrl.searchParams
    
    // Get authorization code from query params
    const code = searchParams.get('code')
    const state = searchParams.get('state')
    const error = searchParams.get('error')
    
    if (error) {
      // OAuth provider returned an error
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000"
      return NextResponse.redirect(
        `${frontendUrl}/login?error=oauth_${error}&provider=${provider}`
      )
    }
    
    if (!code) {
      const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000"
      return NextResponse.redirect(
        `${frontendUrl}/login?error=no_code&provider=${provider}`
      )
    }
    
    // Build callback URL with all query parameters
    const callbackUrl = new URL(`${BACKEND_URL}/api/v1/auth/oauth/${provider}/callback`)
    searchParams.forEach((value, key) => {
      callbackUrl.searchParams.append(key, value)
    })
    
    // Forward to backend callback (backend will handle token exchange and redirect)
    return NextResponse.redirect(callbackUrl.toString())
    
  } catch (error) {
    console.error("OAuth callback error:", error)
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000"
    return NextResponse.redirect(
      `${frontendUrl}/login?error=oauth_failed`
    )
  }
}
