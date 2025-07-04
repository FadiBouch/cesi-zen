import React, { createContext, useState, useEffect, ReactNode } from "react";
import { User } from "../types/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as authService from "../services/auth";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<any>;
  register: (data: any) => Promise<any>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  login: async () => null,
  register: async () => null,
  logout: async () => {},
  refreshUser: async () => {},
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [initialized, setInitialized] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const checkAuthStatus = async () => {
    setLoading(true);
    try {
      const isAuthenticated = await authService.checkAuth();

      if (isAuthenticated) {
        const userData = await authService.getCurrentUser();
        console.log("AuthProvider.userData :", userData);

        setUser(userData);
      } else {
        setUser(null);
      }
    } catch (err) {
      console.error("Error checking auth status:", err);
      setError("Erreur lors de la vérification de l'authentification");
      setUser(null);
    } finally {
      setLoading(false);
      setInitialized(true);
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const login = async (username: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.login({ username, password });
      setUser(response.user);
      return response;
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Erreur lors de la connexion");
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: any) => {
    setLoading(true);
    setError(null);
    try {
      const response = await authService.register(data);
      setUser(response.user);
      return response;
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Erreur lors de l'inscription");
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    try {
      await authService.logout();
      setUser(null);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Erreur lors de la déconnexion");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!initialized && loading) {
    return null; // Ou un composant de chargement initial
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        error,
        login,
        register,
        logout,
        refreshUser: checkAuthStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
