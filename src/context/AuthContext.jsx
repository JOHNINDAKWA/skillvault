import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { authService } from "../services/authService.js";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [authError, setAuthError] = useState(null);

  const loadCurrentUser = useCallback(async () => {
    try {
      const response = await authService.getCurrentUser();

      setUser(response.data.user);
      setAuthError(null);

      return response.data.user;
    } catch (error) {
      setUser(null);

      if (error.status && error.status !== 401) {
        setAuthError(error.message);
      }

      return null;
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function restoreAuthentication() {
      try {
        const response = await authService.getCurrentUser();

        if (isMounted) {
          setUser(response.data.user);
          setAuthError(null);
        }
      } catch (error) {
        if (isMounted) {
          setUser(null);

          if (error.status && error.status !== 401) {
            setAuthError(error.message);
          }
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    restoreAuthentication();

    return () => {
      isMounted = false;
    };
  }, []);

  const register = useCallback(async (details) => {
    setAuthError(null);

    try {
      const response = await authService.register(details);
      const registeredUser = response.data?.user || null;

      if (
        registeredUser &&
        response.data?.requiresEmailConfirmation === false
      ) {
        setUser(registeredUser);
      }

      return response;
    } catch (error) {
      setAuthError(error.message);
      throw error;
    }
  }, []);

  const login = useCallback(async (credentials) => {
    setAuthError(null);

    try {
      const response = await authService.login(credentials);
      const authenticatedUser = response.data.user;

      setUser(authenticatedUser);

      return authenticatedUser;
    } catch (error) {
      setUser(null);
      setAuthError(error.message);
      throw error;
    }
  }, []);

  const updatePassword = useCallback(async (password) => {
    setAuthError(null);

    try {
      const response = await authService.updatePassword(password);
      const updatedUser = response.data.user;

      setUser(updatedUser);

      return updatedUser;
    } catch (error) {
      setAuthError(error.message);
      throw error;
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoggingOut(true);
    setAuthError(null);

    try {
      await authService.logout();
    } finally {
      setUser(null);
      setIsLoggingOut(false);
    }
  }, []);

  const updateProfile = useCallback(async (updates) => {
    setAuthError(null);

    try {
      const response = await authService.updateProfile(updates);
      const updatedUser = response.data.user;

      setUser(updatedUser);

      return updatedUser;
    } catch (error) {
      setAuthError(error.message);
      throw error;
    }
  }, []);

  const clearAuthError = useCallback(() => {
    setAuthError(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isLoading,
      isLoggingOut,
      authError,
      register,
      login,
      updatePassword,
      logout,
      updateProfile,
      loadCurrentUser,
      clearAuthError,
    }),
    [
      user,
      isLoading,
      isLoggingOut,
      authError,
      register,
      login,
      updatePassword,
      logout,
      updateProfile,
      loadCurrentUser,
      clearAuthError,
    ]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
