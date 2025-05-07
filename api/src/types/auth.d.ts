// Types généraux utilisés dans l'application
import { Request } from "express";
import { Role } from "@prisma/client";

// Type pour le payload JWT
export interface JwtPayload {
  id: number;
  username: string;
  role: Role;
  iat?: number;
  exp?: number;
}

// Extension de l'interface Request d'Express pour inclure l'utilisateur authentifié
export interface AuthRequest extends Request {
  user?: JwtPayload;
}

// Type pour les données d'inscription
export interface RegisterData {
  username: string;
  email: string;
  password: string;
  firstname?: string;
  lastname?: string;
  role?: string;
}

// Type pour les données de connexion
export interface LoginData {
  username: string;
  password: string;
}

// Type pour les données de mise à jour du profil
export interface UpdateProfileData {
  firstname?: string;
  lastname?: string;
  email?: string;
}

// Type pour les données de changement de mot de passe
export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

// Type pour les réponses API
export interface ApiResponse<T> {
  message: string;
  data?: T;
  error?: string;
}
