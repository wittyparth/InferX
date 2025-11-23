import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Routes that don't require authentication
const publicRoutes = ['/login', '/register', '/auth/callback']

// Routes that should redirect to dashboard if authenticated
const authRoutes = ['/login', '/register']

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Get token from cookie
  const token = request.cookies.get('access_token')?.value
  
  // Check if route is public
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))
  
  // Allow OAuth callback route without authentication
  if (pathname.startsWith('/auth/callback')) {
    return NextResponse.next()
  }
  
  // If user is authenticated and trying to access auth pages, redirect to dashboard
  if (token && isAuthRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  
  // If user is not authenticated and trying to access protected route
  if (!token && !isPublicRoute && pathname !== '/') {
    // Store the intended destination
    const response = NextResponse.redirect(new URL('/login', request.url))
    response.cookies.set('redirectTo', pathname, { path: '/' })
    return response
  }
  
  return NextResponse.next()
}

// Configure which routes should be checked
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
