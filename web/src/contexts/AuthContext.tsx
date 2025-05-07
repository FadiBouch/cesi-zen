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
  role: string;
  firstName?: string;
  lastName?: string;
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
    // Ajouter un intercepteur pour inclure le token dans toutes les requêtes
    const interceptor = api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("token");
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
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

  // Fonction pour rafraîchir l'état d'authentification
  const refreshAuthState = useCallback(async () => {
    setIsLoading(true);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        setIsAuthenticated(false);
        setUser(null);
        setIsLoading(false);
        return;
      }

      // Vérifier la validité du token
      try {
        const decoded: any = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        if (decoded.exp && decoded.exp < currentTime) {
          // Token expiré, déconnexion
          localStorage.removeItem("token");
          setIsAuthenticated(false);
          setUser(null);
          return;
        }

        // Token valide, récupérer le profil
        const response = await api.get("/auth/profile");

        // Vérifier si l'utilisateur est un admin
        if (response.data.role !== "Admin") {
          // Pas un admin, déconnexion
          logout();
          return;
        }

        setUser(response.data);
        setIsAuthenticated(true);
      } catch (error) {
        console.error("Erreur lors de la vérification du token:", error);
        localStorage.removeItem("token");
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
      const { token, user } = response.data;

      if (user.role !== "Admin") {
        throw new Error(
          "Accès refusé. Seuls les administrateurs peuvent accéder au back-office."
        );
      }

      // Sauvegarder le token
      localStorage.setItem("token", token);

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
    localStorage.removeItem("token");
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
