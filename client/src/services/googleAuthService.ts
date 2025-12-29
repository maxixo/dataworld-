import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export interface GoogleTokenPayload {
  credential: string;
}

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name: string;
    picture?: string;
    googleId?: string;
  };
  token: string;
}

/**
 * Service for handling Google OAuth authentication
 */
class GoogleAuthService {
  /**
   * Handle Google OAuth login
   * Sends the Google ID token to the backend for verification and JWT generation
   */
  async loginWithGoogle(googleToken: string): Promise<AuthResponse> {
    try {
      const response = await axios.post<AuthResponse>(`${API_URL}/api/auth/google/login`, {
        googleToken,
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Google login failed');
      }
      throw new Error('Google login failed');
    }
  }

  /**
   * Handle Google OAuth signup (register new user)
   * Sends the Google ID token to the backend for new account creation
   */
  async signupWithGoogle(googleToken: string): Promise<AuthResponse> {
    try {
      const response = await axios.post<AuthResponse>(`${API_URL}/api/auth/google/signup`, {
        googleToken,
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Google signup failed');
      }
      throw new Error('Google signup failed');
    }
  }

  /**
   * Verify JWT token validity
   * Used on app initialization to validate persisted token
   */
  async verifyToken(token: string): Promise<boolean> {
    try {
      await axios.get(`${API_URL}/api/auth/verify`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Logout user (optional backend call for token blacklisting)
   */
  async logout(token: string): Promise<void> {
    try {
      await axios.post(
        `${API_URL}/api/auth/logout`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
    } catch (error) {
      // Logout is best-effort; don't fail if API call fails
      console.warn('Logout API call failed:', error);
    }
  }

  /**
   * Refresh JWT token
   * Used to extend session without re-authentication
   */
  async refreshToken(token: string): Promise<string> {
    try {
      const response = await axios.post<{ token: string }>(
        `${API_URL}/api/auth/refresh`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data.token;
    } catch (error) {
      throw new Error('Token refresh failed');
    }
  }
}

export const googleAuthService = new GoogleAuthService();
