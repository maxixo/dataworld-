import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../store';
import {
  googleLoginStart,
  googleLoginSuccess,
  googleLoginFailure,
  googleSignupStart,
  googleSignupSuccess,
  googleSignupFailure,
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

  const handleGoogleLogin = async (googleToken: string) => {
    try {
      dispatch(googleLoginStart());
      const response = await googleAuthService.loginWithGoogle(googleToken);
      dispatch(googleLoginSuccess(response));
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Login failed';
      dispatch(googleLoginFailure(errorMessage));
      throw err;
    }
  };

  const handleGoogleSignup = async (googleToken: string) => {
    try {
      dispatch(googleSignupStart());
      const response = await googleAuthService.signupWithGoogle(googleToken);
      dispatch(googleSignupSuccess(response));
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Signup failed';
      dispatch(googleSignupFailure(errorMessage));
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
    handleGoogleLogin,
    handleGoogleSignup,
    handleLogout,
    resetError,
    restoreUserFromStorage,
  };
};
