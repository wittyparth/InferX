/**
 * Authentication Utility with Token Refresh
 * 
 * This module handles:
 * - Token storage (access + refresh)
 * - Automatic token refresh before expiration
 * - Silent background refresh
 * - Logout on refresh failure
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
const TOKEN_REFRESH_THRESHOLD = 5 * 60 * 1000 // 5 minutes before expiry

interface TokenPayload {
  exp: number
  sub: string
  iat: number
}

interface AuthTokens {
  access_token: string
  refresh_token: string
}

class AuthManager {
  private refreshPromise: Promise<string> | null = null
  private refreshTimeout: NodeJS.Timeout | null = null

  /**
   * Store tokens after login
   */
  setTokens(tokens: AuthTokens): void {
    if (typeof window === 'undefined') return
    
    localStorage.setItem('access_token', tokens.access_token)
    localStorage.setItem('refresh_token', tokens.refresh_token)
    
    // Set cookie for middleware
    document.cookie = `access_token=${tokens.access_token}; path=/; max-age=86400; SameSite=Strict`
    
    // Schedule background refresh
    this.scheduleTokenRefresh(tokens.access_token)
  }

  /**
   * Get access token, refreshing if needed
   */
  async getAccessToken(): Promise<string | null> {
    if (typeof window === 'undefined') return null
    
    const accessToken = localStorage.getItem('access_token')
    if (!accessToken) return null

    // Check if token is expired or about to expire
    if (this.isTokenExpired(accessToken)) {
      return this.refreshAccessToken()
    }

    return accessToken
  }

  /**
   * Get refresh token
   */
  getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null
    return localStorage.getItem('refresh_token')
  }

  /**
   * Clear all tokens (logout)
   */
  clearTokens(): void {
    if (typeof window === 'undefined') return
    
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user_email')
    localStorage.removeItem('user_name')
    
    // Clear cookie
    document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
    
    // Clear scheduled refresh
    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout)
      this.refreshTimeout = null
    }
  }

  /**
   * Parse JWT token to get payload
   */
  private parseToken(token: string): TokenPayload | null {
    try {
      const parts = token.split('.')
      if (parts.length !== 3) return null
      
      const payload = JSON.parse(atob(parts[1]))
      return payload
    } catch {
      return null
    }
  }

  /**
   * Check if token is expired or about to expire
   */
  private isTokenExpired(token: string): boolean {
    const payload = this.parseToken(token)
    if (!payload) return true
    
    const now = Date.now()
    const expiresAt = payload.exp * 1000 // Convert to ms
    
    // Consider expired if within threshold
    return now >= expiresAt - TOKEN_REFRESH_THRESHOLD
  }

  /**
   * Get time until token expires
   */
  private getTokenTimeToExpiry(token: string): number {
    const payload = this.parseToken(token)
    if (!payload) return 0
    
    const now = Date.now()
    const expiresAt = payload.exp * 1000
    
    return Math.max(0, expiresAt - now - TOKEN_REFRESH_THRESHOLD)
  }

  /**
   * Schedule automatic token refresh
   */
  private scheduleTokenRefresh(token: string): void {
    // Clear existing timeout
    if (this.refreshTimeout) {
      clearTimeout(this.refreshTimeout)
    }

    const timeToRefresh = this.getTokenTimeToExpiry(token)
    
    if (timeToRefresh > 0) {
      this.refreshTimeout = setTimeout(() => {
        this.refreshAccessToken().catch(console.error)
      }, timeToRefresh)
    }
  }

  /**
   * Refresh the access token using refresh token
   */
  async refreshAccessToken(): Promise<string> {
    // Prevent multiple simultaneous refresh requests
    if (this.refreshPromise) {
      return this.refreshPromise
    }

    this.refreshPromise = this.doRefresh()
    
    try {
      return await this.refreshPromise
    } finally {
      this.refreshPromise = null
    }
  }

  private async doRefresh(): Promise<string> {
    const refreshToken = this.getRefreshToken()
    
    if (!refreshToken) {
      this.clearTokens()
      throw new Error('No refresh token available')
    }

    try {
      const response = await fetch(`${API_URL}/api/v1/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      })

      if (!response.ok) {
        // Refresh token is invalid, logout
        this.clearTokens()
        window.location.href = '/login'
        throw new Error('Token refresh failed')
      }

      const data = await response.json()
      const newTokens: AuthTokens = {
        access_token: data.data?.access_token || data.access_token,
        refresh_token: data.data?.refresh_token || data.refresh_token || refreshToken,
      }

      this.setTokens(newTokens)
      
      return newTokens.access_token
    } catch (error) {
      this.clearTokens()
      throw error
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false
    
    const token = localStorage.getItem('access_token')
    if (!token) return false
    
    // For basic check, just verify token exists
    // The actual validity will be checked when making API calls
    return true
  }

  /**
   * Initialize auth manager (call on app load)
   */
  init(): void {
    if (typeof window === 'undefined') return
    
    const token = localStorage.getItem('access_token')
    if (token && !this.isTokenExpired(token)) {
      this.scheduleTokenRefresh(token)
    } else if (token && this.getRefreshToken()) {
      // Token expired but refresh token exists, try to refresh
      this.refreshAccessToken().catch(() => {
        // Silent fail, user will be redirected on next API call
      })
    }
  }
}

// Singleton instance
export const authManager = new AuthManager()

// Convenience exports
export const getAccessToken = () => authManager.getAccessToken()
export const setAuthTokens = (tokens: AuthTokens) => authManager.setTokens(tokens)
export const clearAuthTokens = () => authManager.clearTokens()
export const isAuthenticated = () => authManager.isAuthenticated()
export const initAuth = () => authManager.init()

// React hook for authentication
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

export function useAuth() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = authManager.isAuthenticated()
      setIsLoggedIn(authenticated)
      setIsLoading(false)
      
      if (authenticated) {
        authManager.init()
      }
    }
    
    checkAuth()
  }, [])

  const logout = useCallback(() => {
    authManager.clearTokens()
    setIsLoggedIn(false)
    router.push('/login')
  }, [router])

  const login = useCallback((tokens: AuthTokens) => {
    authManager.setTokens(tokens)
    setIsLoggedIn(true)
  }, [])

  return {
    isLoading,
    isLoggedIn,
    logout,
    login,
    getAccessToken: authManager.getAccessToken.bind(authManager),
  }
}
