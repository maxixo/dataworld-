import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import {
  googleLoginStart,
  googleLoginSuccess,
  googleLoginFailure,
  logout,
  clearError,
  setUser,
} from '../store/authSlice';
import { googleAuthService } from '../services/googleAuthService';

export const useReduxAuth = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { user, token, isAuthenticated, loading, error } = useSelector(
    (state: RootState) => state.auth
  );

  /**
   * Handle Google authentication with user data (NOT Firebase token)
   * @param userData - User data from Firebase (email, displayName, photoURL, uid)
   */
  const handleGoogleAuth = async (userData: {
    email: string;
    displayName: string | null;
    photoURL: string | null;
    uid: string;
  }) => {
    try {
      dispatch(googleLoginStart());
      
      console.log('📤 Sending Google user data to backend...');
      
      // Send user data to backend (NOT Firebase token)
      const response = await googleAuthService.authenticateWithGoogle(userData);
      
      console.log('✅ Backend response received');
      
      dispatch(googleLoginSuccess(response));
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
      console.error('❌ Redux auth error:', errorMessage);
      dispatch(googleLoginFailure(errorMessage));
      throw err;
    }
  };

  const handleLogout = async () => {
    if (token) {
      try {
        await googleAuthService.logout(token);
      } catch (err) {
        console.warn('Logout error:', err);
      }
    }
    dispatch(logout());
  };

  const resetError = () => {
    dispatch(clearError());
  };

  const restoreUserFromStorage = (userData: any, authToken: string) => {
    dispatch(setUser({ user: userData, token: authToken }));
  };

  return {
    user,
    token,
    isAuthenticated,
    loading,
    error,
    handleGoogleAuth,
    handleLogout,
    resetError,
    restoreUserFromStorage,
  };
};