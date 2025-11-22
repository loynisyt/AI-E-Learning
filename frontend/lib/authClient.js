/**
 * Frontend authentication client library
 * Handles all auth-related API calls and session management
 */

'use client';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://127.0.0.1:4000';

class AuthClient {
  /**
   * Register a new user with email/password
   */
  static async register(email, name, password) {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, name, password })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Registration failed');
    }

    return response.json();
  }

  /**
   * Login with email/password
   */
  static async login(email, password) {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Login failed');
    }

    return response.json();
  }

  /**
   * Verify email with token
   */
  static async verifyEmail(token, email) {
    const response = await fetch(`${API_BASE_URL}/api/auth/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ token, email })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Email verification failed');
    }

    return response.json();
  }

  /**
   * Get current session/authenticated user
   */
  static async getSession() {
    const response = await fetch(`${API_BASE_URL}/api/auth/session`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    });

    if (!response.ok) {
      // Not authenticated
      return null;
    }

    return response.json();
  }

  /**
   * Logout and revoke session
   */
  static async logout() {
    const response = await fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Logout failed');
    }

    return response.json();
  }

  /**
   * Connect OAuth provider to authenticated user
   */
  static async connectProvider(provider, providerId, providerEmail) {
    const response = await fetch(`${API_BASE_URL}/api/auth/connect-provider`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        provider,
        providerId,
        providerEmail
      })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Provider connection failed');
    }

    return response.json();
  }

  /**
   * Disconnect OAuth provider from authenticated user
   */
  static async disconnectProvider(provider) {
    const response = await fetch(`${API_BASE_URL}/api/auth/disconnect-provider`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ provider })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Provider disconnection failed');
    }

    return response.json();
  }
}

export default AuthClient;
