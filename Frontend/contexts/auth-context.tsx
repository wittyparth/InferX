"use client"

import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react'
import { useRouter } from 'next/navigation'

const API_URL = process.env.NEXT_PUBLIC_API_URL || ''
const TOKEN_REFRESH_THRESHOLD = 5 * 60 * 1000 // 5 minutes before expiry

interface AuthContextType {
    isLoading: boolean
    isAuthenticated: boolean
    login: (accessToken: string, refreshToken?: string, email?: string) => void
    logout: () => void
    getAccessToken: () => Promise<string | null>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface TokenPayload {
    exp: number
    sub: string
    iat: number
}

function parseToken(token: string): TokenPayload | null {
    try {
        const parts = token.split('.')
        if (parts.length !== 3) return null
        const payload = JSON.parse(atob(parts[1]))
        return payload
    } catch {
        return null
    }
}

function isTokenExpired(token: string): boolean {
    const payload = parseToken(token)
    if (!payload) return true
    const now = Date.now()
    const expiresAt = payload.exp * 1000
    return now >= expiresAt - TOKEN_REFRESH_THRESHOLD
}

function getTokenTimeToExpiry(token: string): number {
    const payload = parseToken(token)
    if (!payload) return 0
    const now = Date.now()
    const expiresAt = payload.exp * 1000
    return Math.max(0, expiresAt - now - TOKEN_REFRESH_THRESHOLD)
}

export function AuthProvider({ children }: { children: ReactNode }) {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(true)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [refreshTimeout, setRefreshTimeoutId] = useState<NodeJS.Timeout | null>(null)
    const [refreshPromise, setRefreshPromise] = useState<Promise<string> | null>(null)

    const clearTokens = useCallback(() => {
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
        localStorage.removeItem('user_email')
        localStorage.removeItem('user_name')
        document.cookie = 'access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'

        if (refreshTimeout) {
            clearTimeout(refreshTimeout)
            setRefreshTimeoutId(null)
        }

        setIsAuthenticated(false)
    }, [refreshTimeout])

    const refreshAccessToken = useCallback(async (): Promise<string> => {
        const refreshToken = localStorage.getItem('refresh_token')

        if (!refreshToken) {
            clearTokens()
            throw new Error('No refresh token available')
        }

        try {
            const response = await fetch(`${API_URL}/api/auth/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refresh_token: refreshToken }),
            })

            if (!response.ok) {
                clearTokens()
                router.push('/login')
                throw new Error('Token refresh failed')
            }

            const data = await response.json()
            const newAccessToken = data.access_token
            const newRefreshToken = data.refresh_token || refreshToken

            localStorage.setItem('access_token', newAccessToken)
            localStorage.setItem('refresh_token', newRefreshToken)
            document.cookie = `access_token=${newAccessToken}; path=/; max-age=86400; SameSite=Strict`

            // Schedule next refresh
            const timeToRefresh = getTokenTimeToExpiry(newAccessToken)
            if (timeToRefresh > 0) {
                const timeout = setTimeout(() => {
                    refreshAccessToken().catch(console.error)
                }, timeToRefresh)
                setRefreshTimeoutId(timeout)
            }

            return newAccessToken
        } catch (error) {
            clearTokens()
            throw error
        }
    }, [clearTokens, router])

    const getAccessToken = useCallback(async (): Promise<string | null> => {
        const accessToken = localStorage.getItem('access_token')
        if (!accessToken) return null

        if (isTokenExpired(accessToken)) {
            // Prevent multiple simultaneous refresh requests
            if (refreshPromise) {
                return refreshPromise
            }

            const promise = refreshAccessToken()
            setRefreshPromise(promise)

            try {
                return await promise
            } finally {
                setRefreshPromise(null)
            }
        }

        return accessToken
    }, [refreshAccessToken, refreshPromise])

    const login = useCallback((accessToken: string, refreshToken?: string, email?: string) => {
        localStorage.setItem('access_token', accessToken)
        if (refreshToken) {
            localStorage.setItem('refresh_token', refreshToken)
        }
        if (email) {
            localStorage.setItem('user_email', email)
        }
        document.cookie = `access_token=${accessToken}; path=/; max-age=86400; SameSite=Strict`

        // Schedule token refresh
        const timeToRefresh = getTokenTimeToExpiry(accessToken)
        if (timeToRefresh > 0) {
            const timeout = setTimeout(() => {
                refreshAccessToken().catch(console.error)
            }, timeToRefresh)
            setRefreshTimeoutId(timeout)
        }

        setIsAuthenticated(true)
    }, [refreshAccessToken])

    const logout = useCallback(() => {
        clearTokens()
        router.push('/login')
    }, [clearTokens, router])

    // Initialize on mount
    useEffect(() => {
        const token = localStorage.getItem('access_token')

        if (token) {
            if (!isTokenExpired(token)) {
                // Token is valid, schedule refresh
                setIsAuthenticated(true)
                const timeToRefresh = getTokenTimeToExpiry(token)
                if (timeToRefresh > 0) {
                    const timeout = setTimeout(() => {
                        refreshAccessToken().catch(console.error)
                    }, timeToRefresh)
                    setRefreshTimeoutId(timeout)
                }
            } else if (localStorage.getItem('refresh_token')) {
                // Token expired but we have refresh token, try to refresh
                refreshAccessToken()
                    .then(() => setIsAuthenticated(true))
                    .catch(() => setIsAuthenticated(false))
            } else {
                // No valid token
                setIsAuthenticated(false)
            }
        } else {
            setIsAuthenticated(false)
        }

        setIsLoading(false)

        // Cleanup on unmount
        return () => {
            if (refreshTimeout) {
                clearTimeout(refreshTimeout)
            }
        }
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <AuthContext.Provider value={{ isLoading, isAuthenticated, login, logout, getAccessToken }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
