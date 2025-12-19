// API Client for backend communication
// Centralized configuration for all API calls

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
const API_VERSION = "/api/v1"

export const API_ENDPOINTS = {
  // Auth
  LOGIN: `${API_BASE_URL}${API_VERSION}/auth/login`,
  REGISTER: `${API_BASE_URL}${API_VERSION}/auth/register`,
  REFRESH: `${API_BASE_URL}${API_VERSION}/auth/refresh`,
  LOGOUT: `${API_BASE_URL}${API_VERSION}/auth/logout`,
  
  // Users
  USER_ME: `${API_BASE_URL}${API_VERSION}/users/me`,
  USER_UPDATE: `${API_BASE_URL}${API_VERSION}/users/me`,
  
  // Models
  MODELS: `${API_BASE_URL}${API_VERSION}/models`,
  MODEL_UPLOAD: `${API_BASE_URL}${API_VERSION}/models/upload`,
  MODEL_DETAIL: (id: string) => `${API_BASE_URL}${API_VERSION}/models/${id}`,
  MODEL_UPDATE: (id: string) => `${API_BASE_URL}${API_VERSION}/models/${id}`,
  MODEL_DELETE: (id: string) => `${API_BASE_URL}${API_VERSION}/models/${id}`,
  MODEL_ANALYTICS: (id: string) => `${API_BASE_URL}${API_VERSION}/models/${id}/analytics`,
  
  // Predictions
  PREDICTIONS: `${API_BASE_URL}${API_VERSION}/predict/history`,
  PREDICT: (modelId: string) => `${API_BASE_URL}${API_VERSION}/predict/${modelId}`,
  
  // API Keys
  API_KEYS: `${API_BASE_URL}${API_VERSION}/api-keys`,
  API_KEY_CREATE: `${API_BASE_URL}${API_VERSION}/api-keys`,
  API_KEY_DELETE: (id: string) => `${API_BASE_URL}${API_VERSION}/api-keys/${id}`,
  
  // Model Shares
  MODEL_SHARES: (modelId: string) => `${API_BASE_URL}${API_VERSION}/models/${modelId}/shares`,
  MODEL_SHARE_CREATE: (modelId: string) => `${API_BASE_URL}${API_VERSION}/models/${modelId}/share`,
  MODEL_SHARE_UPDATE: (modelId: string, shareId: string) => `${API_BASE_URL}${API_VERSION}/models/${modelId}/shares/${shareId}`,
  MODEL_SHARE_DELETE: (modelId: string, shareId: string) => `${API_BASE_URL}${API_VERSION}/models/${modelId}/shares/${shareId}`,
  SHARED_WITH_ME: `${API_BASE_URL}${API_VERSION}/models/shared-with-me`,
  
  // Webhooks
  WEBHOOKS: `${API_BASE_URL}${API_VERSION}/webhooks`,
  WEBHOOK_DETAIL: (id: string) => `${API_BASE_URL}${API_VERSION}/webhooks/${id}`,
  WEBHOOK_TEST: (id: string) => `${API_BASE_URL}${API_VERSION}/webhooks/${id}/test`,
  
  // Health
  HEALTH: `${API_BASE_URL}${API_VERSION}/health`,
}

interface FetchOptions extends RequestInit {
  token?: string
  skipRefresh?: boolean // Prevent infinite refresh loops
}

// Token refresh state
let isRefreshing = false
let refreshPromise: Promise<string> | null = null

async function refreshToken(): Promise<string> {
  const refreshToken = typeof window !== "undefined" ? localStorage.getItem("refresh_token") : null
  
  if (!refreshToken) {
    throw new Error("No refresh token available")
  }

  const response = await fetch("/api/auth/refresh", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
  })

  if (!response.ok) {
    // Clear tokens and redirect to login
    if (typeof window !== "undefined") {
      localStorage.removeItem("access_token")
      localStorage.removeItem("refresh_token")
      localStorage.removeItem("user_email")
      document.cookie = "access_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
      window.location.href = "/login"
    }
    throw new Error("Token refresh failed")
  }

  const data = await response.json()
  const newAccessToken = data.access_token
  const newRefreshToken = data.refresh_token

  if (typeof window !== "undefined") {
    localStorage.setItem("access_token", newAccessToken)
    if (newRefreshToken) {
      localStorage.setItem("refresh_token", newRefreshToken)
    }
    document.cookie = `access_token=${newAccessToken}; path=/; max-age=86400; SameSite=Strict`
  }

  return newAccessToken
}

async function getValidToken(): Promise<string | null> {
  if (isRefreshing && refreshPromise) {
    return refreshPromise
  }
  return typeof window !== "undefined" ? localStorage.getItem("access_token") : null
}

export class ApiClient {
  private static getAuthHeader(token?: string): HeadersInit {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    }
    
    const storedToken = typeof window !== "undefined" ? localStorage.getItem("access_token") : null
    const authToken = token || storedToken
    
    if (authToken) {
      headers["Authorization"] = `Bearer ${authToken}`
    }
    
    return headers
  }

  static async request<T>(
    url: string,
    options: FetchOptions = {}
  ): Promise<T> {
    const { token, skipRefresh, ...fetchOptions } = options
    
    const response = await fetch(url, {
      ...fetchOptions,
      headers: {
        ...this.getAuthHeader(token),
        ...fetchOptions.headers,
      },
    })

    // Handle 401 Unauthorized - try to refresh token
    if (response.status === 401 && !skipRefresh) {
      try {
        // Prevent multiple simultaneous refresh requests
        if (!isRefreshing) {
          isRefreshing = true
          refreshPromise = refreshToken()
        }
        
        const newToken = await refreshPromise
        isRefreshing = false
        refreshPromise = null
        
        // Retry the original request with new token
        const retryResponse = await fetch(url, {
          ...fetchOptions,
          headers: {
            ...this.getAuthHeader(newToken || undefined),
            ...fetchOptions.headers,
          },
        })
        
        if (!retryResponse.ok) {
          const error = await retryResponse.json().catch(() => ({
            detail: "An unexpected error occurred",
          }))
          throw new Error(error.detail || `HTTP error! status: ${retryResponse.status}`)
        }
        
        return retryResponse.json()
      } catch (refreshError) {
        isRefreshing = false
        refreshPromise = null
        throw refreshError
      }
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        detail: "An unexpected error occurred",
      }))
      throw new Error(error.detail || `HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  static async get<T>(url: string, token?: string): Promise<T> {
    return this.request<T>(url, { method: "GET", token })
  }

  static async post<T>(url: string, data: unknown, token?: string): Promise<T> {
    return this.request<T>(url, {
      method: "POST",
      body: JSON.stringify(data),
      token,
    })
  }

  static async patch<T>(url: string, data: unknown, token?: string): Promise<T> {
    return this.request<T>(url, {
      method: "PATCH",
      body: JSON.stringify(data),
      token,
    })
  }

  static async delete<T>(url: string, token?: string): Promise<T> {
    return this.request<T>(url, { method: "DELETE", token })
  }

  static async uploadFile<T>(
    url: string,
    formData: FormData,
    token?: string
  ): Promise<T> {
    const storedToken = typeof window !== "undefined" ? localStorage.getItem("access_token") : null
    const authToken = token || storedToken
    
    let response = await fetch(url, {
      method: "POST",
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
      body: formData,
    })

    // Handle 401 Unauthorized - try to refresh token
    if (response.status === 401) {
      try {
        if (!isRefreshing) {
          isRefreshing = true
          refreshPromise = refreshToken()
        }
        
        const newToken = await refreshPromise
        isRefreshing = false
        refreshPromise = null
        
        // Retry upload with new token
        response = await fetch(url, {
          method: "POST",
          headers: { Authorization: `Bearer ${newToken}` },
          body: formData,
        })
      } catch (refreshError) {
        isRefreshing = false
        refreshPromise = null
        throw refreshError
      }
    }

    if (!response.ok) {
      const error = await response.json().catch(() => ({
        detail: "Upload failed",
      }))
      throw new Error(error.detail || `Upload error! status: ${response.status}`)
    }

    return response.json()
  }
}

// Export convenience methods
export const api = {
  auth: {
    login: (email: string, password: string) =>
      ApiClient.post(API_ENDPOINTS.LOGIN, { email, password }),
    register: (email: string, password: string, full_name?: string) =>
      ApiClient.post(API_ENDPOINTS.REGISTER, { email, password, full_name }),
    logout: (token?: string) => ApiClient.post(API_ENDPOINTS.LOGOUT, {}, token),
  },
  users: {
    me: (token?: string) => ApiClient.get(API_ENDPOINTS.USER_ME, token),
    update: (data: unknown, token?: string) =>
      ApiClient.patch(API_ENDPOINTS.USER_UPDATE, data, token),
  },
  models: {
    list: (page: number = 1, per_page: number = 20, status_filter?: string, token?: string) => {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: per_page.toString(),
        ...(status_filter && { status: status_filter }),
      })
      return ApiClient.get(`${API_ENDPOINTS.MODELS}?${params}`, token)
    },
    get: (id: string, token?: string) =>
      ApiClient.get(API_ENDPOINTS.MODEL_DETAIL(id), token),
    upload: (
      file: File,
      name: string,
      description: string | undefined,
      model_type: string,
      token?: string
    ) => {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("name", name)
      if (description) {
        formData.append("description", description)
      }
      formData.append("model_type", model_type)
      return ApiClient.uploadFile(API_ENDPOINTS.MODEL_UPLOAD, formData, token)
    },
    update: (id: string, data: unknown, token?: string) =>
      ApiClient.patch(API_ENDPOINTS.MODEL_UPDATE(id), data, token),
    delete: (id: string, token?: string) =>
      ApiClient.delete(API_ENDPOINTS.MODEL_DELETE(id), token),
    analytics: (id: string, days: number = 7, token?: string) => {
      const params = new URLSearchParams({ days: days.toString() })
      return ApiClient.get(`${API_ENDPOINTS.MODEL_ANALYTICS(id)}?${params}`, token)
    },
  },
  predictions: {
    list: (model_id?: string, page: number = 1, per_page: number = 20, token?: string) => {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: per_page.toString(),
        ...(model_id && { model_id }),
      })
      return ApiClient.get(`${API_ENDPOINTS.PREDICTIONS}?${params}`, token)
    },
    create: (modelId: string, input: unknown, version?: number, token?: string) =>
      ApiClient.post(API_ENDPOINTS.PREDICT(modelId), { input, version }, token),
  },
  apiKeys: {
    list: (token?: string) => ApiClient.get(API_ENDPOINTS.API_KEYS, token),
    create: (name: string, expires_days?: number, token?: string) =>
      ApiClient.post(API_ENDPOINTS.API_KEY_CREATE, { name, expires_days }, token),
    delete: (id: string, token?: string) =>
      ApiClient.delete(API_ENDPOINTS.API_KEY_DELETE(id), token),
  },
  modelShares: {
    list: (modelId: string, token?: string) =>
      ApiClient.get(API_ENDPOINTS.MODEL_SHARES(modelId), token),
    create: (modelId: string, shared_with_email: string, permission: string = "view", token?: string) =>
      ApiClient.post(API_ENDPOINTS.MODEL_SHARE_CREATE(modelId), { shared_with_email, permission }, token),
    update: (modelId: string, shareId: string, permission: string, token?: string) =>
      ApiClient.patch(API_ENDPOINTS.MODEL_SHARE_UPDATE(modelId, shareId), { permission }, token),
    delete: (modelId: string, shareId: string, token?: string) =>
      ApiClient.delete(API_ENDPOINTS.MODEL_SHARE_DELETE(modelId, shareId), token),
    sharedWithMe: (page: number = 1, per_page: number = 20, token?: string) => {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: per_page.toString(),
      })
      return ApiClient.get(`${API_ENDPOINTS.SHARED_WITH_ME}?${params}`, token)
    },
  },
  webhooks: {
    list: (page: number = 1, per_page: number = 20, token?: string) => {
      const params = new URLSearchParams({
        page: page.toString(),
        per_page: per_page.toString(),
      })
      return ApiClient.get(`${API_ENDPOINTS.WEBHOOKS}?${params}`, token)
    },
    get: (id: string, token?: string) =>
      ApiClient.get(API_ENDPOINTS.WEBHOOK_DETAIL(id), token),
    create: (data: unknown, token?: string) =>
      ApiClient.post(API_ENDPOINTS.WEBHOOKS, data, token),
    update: (id: string, data: unknown, token?: string) =>
      ApiClient.patch(API_ENDPOINTS.WEBHOOK_DETAIL(id), data, token),
    delete: (id: string, token?: string) =>
      ApiClient.delete(API_ENDPOINTS.WEBHOOK_DETAIL(id), token),
    test: (id: string, token?: string) =>
      ApiClient.post(API_ENDPOINTS.WEBHOOK_TEST(id), {}, token),
  },
}

export default ApiClient
