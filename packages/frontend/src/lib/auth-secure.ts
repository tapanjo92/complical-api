// Secure authentication service using httpOnly cookies
import { config } from '@/lib/config'

export interface AuthResponse {
  message: string
  email: string
  companyName?: string
  csrfToken?: string
}

export interface User {
  email: string
  companyName?: string
}

class AuthService {
  private csrfToken: string | null = null

  // Initialize CSRF token from cookie
  constructor() {
    this.initializeCsrfToken()
  }

  private initializeCsrfToken() {
    // Extract CSRF token from cookie (non-httpOnly)
    const match = document.cookie.match(/csrf_token=([^;]+)/)
    if (match) {
      this.csrfToken = match[1]
    }
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }
    
    if (this.csrfToken) {
      headers['X-CSRF-Token'] = this.csrfToken
    }
    
    return headers
  }

  async register(email: string, password: string, companyName?: string): Promise<AuthResponse> {
    const response = await fetch(`${config.API_URL}/v1/auth/register`, {
      method: 'POST',
      headers: this.getHeaders(),
      credentials: 'include', // Include cookies
      body: JSON.stringify({ email, password, companyName }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Registration failed')
    }

    const data = await response.json()
    return data
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await fetch(`${config.API_URL}/v1/auth/login`, {
      method: 'POST',
      headers: this.getHeaders(),
      credentials: 'include', // Include cookies
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || 'Login failed')
    }

    const data = await response.json()
    
    // Update CSRF token if provided
    if (data.csrfToken) {
      this.csrfToken = data.csrfToken
    }
    
    return data
  }

  async logout(): Promise<void> {
    try {
      await fetch(`${config.API_URL}/v1/auth/logout`, {
        method: 'POST',
        headers: this.getHeaders(),
        credentials: 'include',
      })
    } finally {
      // Clear CSRF token
      this.csrfToken = null
    }
  }

  async refreshToken(): Promise<boolean> {
    try {
      const response = await fetch(`${config.API_URL}/v1/auth/refresh`, {
        method: 'POST',
        headers: this.getHeaders(),
        credentials: 'include',
      })

      if (!response.ok) {
        return false
      }

      // Re-initialize CSRF token if needed
      this.initializeCsrfToken()
      return true
    } catch {
      return false
    }
  }

  // Check if user is authenticated (requires server-side check)
  async checkAuth(): Promise<User | null> {
    try {
      // Try to refresh token - if successful, user is authenticated
      const refreshed = await this.refreshToken()
      if (!refreshed) {
        return null
      }

      // Get user info from a protected endpoint
      // For now, we'll parse the JWT from the cookie on the server side
      // This would require a new endpoint to get current user info
      return null // TODO: Implement user info endpoint
    } catch {
      return null
    }
  }

  // Helper to make authenticated API calls
  async authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
      credentials: 'include', // Always include cookies
    })

    // If 401, try to refresh token and retry once
    if (response.status === 401) {
      const refreshed = await this.refreshToken()
      if (refreshed) {
        return fetch(url, {
          ...options,
          headers: {
            ...this.getHeaders(),
            ...options.headers,
          },
          credentials: 'include',
        })
      }
    }

    return response
  }
}

// Export singleton instance
export const authService = new AuthService()

// Export convenience functions
export const login = (email: string, password: string) => authService.login(email, password)
export const register = (email: string, password: string, companyName?: string) => authService.register(email, password, companyName)
export const logout = () => authService.logout()
export const refreshToken = () => authService.refreshToken()
export const checkAuth = () => authService.checkAuth()
export const authenticatedFetch = (url: string, options?: RequestInit) => authService.authenticatedFetch(url, options)