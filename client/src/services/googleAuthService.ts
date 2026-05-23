import axios from 'axios';
import { API_BASE_URL } from '../config/api';

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

class GoogleAuthService {
  async authenticateWithGoogle(user: {
    email: string;
    displayName: string | null;
    photoURL: string | null;
    uid: string;
  }): Promise<AuthResponse> {
    try {
      const response = await axios.post<AuthResponse>(
        `${API_BASE_URL}/auth/google`,
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
        console.error('Backend error:', message);
        throw new Error(message);
      }

      throw new Error('Google authentication failed');
    }
  }

  async verifyToken(token: string): Promise<boolean> {
    try {
      await axios.get(`${API_BASE_URL}/auth/verify`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  async logout(token: string): Promise<void> {
    try {
      await axios.post(
        `${API_BASE_URL}/auth/logout`,
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
