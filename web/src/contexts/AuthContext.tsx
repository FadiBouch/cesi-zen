import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import api from "../services/api";

interface User {
  id: number;
  username: string;
  email: string;
  role: Role;
  firstName?: string;
  lastName?: string;
  roleId: number;
}
interface Role {
  id: number;
  name: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  refreshAuthState: () => Promise<void>; // Nouvelle méthode pour rafraîchir manuellement l'état
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Configurer l'intercepteur Axios une seule fois
  useEffect(() => {
    try {
      localStorage.setItem("test", "value");
      const test = localStorage.getItem("test");
      localStorage.removeItem("test");
      console.log("📦 localStorage fonctionne:", test === "value");
    } catch (error) {
      console.error("❌ Problème avec localStorage:", error);
    }

    // Ajouter un intercepteur pour inclure le token dans toutes les requêtes
    const interceptor = api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("token");
        if (token) {
          config.headers!!.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Nettoyer l'intercepteur lors du démontage du composant
    return () => {
      api.interceptors.request.eject(interceptor);
    };
  }, []);

  const refreshAuthState = useCallback(async () => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 100));

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setIsAuthenticated(false);
        setUser(null);
        setIsLoading(false);
        return;
      }

      try {
        const decoded: any = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        if (decoded.exp && decoded.exp < currentTime) {
          localStorage.removeItem("token");
          localStorage.removeItem("refreshToken");
          setIsAuthenticated(false);
          setUser(null);
          return;
        }

        const response = await api.get("/auth/profile");
        console.log("ROLE : ", response.data);

        if (response.data.role.name !== "Admin") {
          logout();
          return;
        }

        setUser(response.data);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Erreur lors de la vérification du token:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken");
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (error) {
      console.error(
        "Erreur lors du rafraîchissement de l'état d'authentification:",
        error
      );
      setIsAuthenticated(false);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshAuthState();

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === "token" && event.newValue !== event.oldValue) {
        refreshAuthState();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [refreshAuthState]);

  const login = async (username: string, password: string) => {
    try {
      const response = await api.post("/auth/login", {
        username,
        password,
      });
      const { token, refreshToken, user } = response.data;

      if (user.role.name !== "Admin") {
        throw new Error(
          "Accès refusé. Seuls les administrateurs peuvent accéder au back-office."
        );
      }

      // Sauvegarder les tokens
      localStorage.setItem("token", token);
      localStorage.setItem("refreshToken", refreshToken);

      setUser(user);
      setIsAuthenticated(true);
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(error.response.data.message || "Échec de la connexion");
      } else if (error instanceof Error) {
        throw error;
      } else {
        throw new Error("Échec de la connexion");
      }
    }
  };

  const logout = () => {
    console.log("🚪 LOGOUT appelé");
    console.log("🗑️ Suppression tokens du localStorage");
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        isLoading,
        login,
        logout,
        refreshAuthState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
