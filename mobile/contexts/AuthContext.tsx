// src/contexts/AuthContext.tsx

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import * as SecureStore from "expo-secure-store";
import { User } from "../types";
import api from "../services/api";

interface AuthContextData {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUp: (username: string, email: string, password: string) => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Vérifier s'il existe un token stocké
    loadStoredToken();
  }, []);

  async function loadStoredToken() {
    setIsLoading(true);
    try {
      const token = await SecureStore.getItemAsync("auth_token");

      if (token) {
        api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
        // Charger le profil utilisateur
        const response = await api.get("/api/auth/profile");
        setUser(response.data);
      }
    } catch (error) {
      console.error("Failed to restore authentication state", error);
      await SecureStore.deleteItemAsync("auth_token");
    } finally {
      setIsLoading(false);
    }
  }

  async function signIn(email: string, password: string) {
    try {
      const response = await api.post("/api/auth/login", { email, password });
      const { token, user } = response.data;

      // Stocker le token
      await SecureStore.setItemAsync("auth_token", token);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      setUser(user);
    } catch (error) {
      console.error("Sign in failed", error);
      throw error;
    }
  }

  async function signUp(username: string, email: string, password: string) {
    try {
      const response = await api.post("/api/auth/register", {
        username,
        email,
        password,
      });
      const { token, user } = response.data;

      // Stocker le token
      await SecureStore.setItemAsync("auth_token", token);
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      setUser(user);
    } catch (error) {
      console.error("Sign up failed", error);
      throw error;
    }
  }

  async function signOut() {
    // Supprimer le token
    await SecureStore.deleteItemAsync("auth_token");
    delete api.defaults.headers.common["Authorization"];
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        signIn,
        signOut,
        signUp,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  return context;
}
