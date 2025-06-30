// types/auth.ts - modifié pour s'adapter à la connexion par username
export interface User {
  id: number;
  userName: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: "User" | "Admin";
}

export interface AuthResponse {
  token: string;
  user: User;
}

// Modifié pour utiliser username au lieu d'email
export interface LoginCredentials {
  username: string;
  password: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface User {
  id: string | number;
  username: string;
  email: string;
  createdAt?: string;
  updatedAt?: string;
}
