import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export interface AuthResponse {
  user: {
    id: string;
    username: string;
    email: string;
    role: string;
    picture?: string;
    googleId?: string;
    createdAt?: string;
  };
  token: string;
}

/**
 * Service for handling Google authentication (client-side Firebase only)
 */
class GoogleAuthService {
  /**
   * Send Google user info to backend for authentication
   * Backend will create/login user and return JWT
   */
  async authenticateWithGoogle(user: {
    email: string;
    displayName: string | null;
    photoURL: string | null;
    uid: string;
  }): Promise<AuthResponse> {
    try {
const response = await axios.post<AuthResponse>(
        `${API_URL}/api/auth/google`,
        {
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
          uid: user.uid,
        }
      );

return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const message = error.response?.data?.message || 'Google authentication failed';
        console.error('❌ Backend error:', message);
        throw new Error(message);
      }
      throw new Error('Google authentication failed');
    }
  }

  /**
   * Verify JWT token validity
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
   * Logout user
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
      console.warn('Logout API call failed:', error);
    }
  }
}

export const googleAuthService = new GoogleAuthService();