import { Request } from "express";
import { Role } from "@prisma/client";

export interface JwtPayload {
  id: number;
  username: string;
  role: Role;
  iat?: number;
  exp?: number;
}

export interface AuthRequest extends Request {
  user?: JwtPayload;
}

export interface RegisterData {
  userName: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  role?: string;
}

export interface LoginData {
  username: string;
  password: string;
}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  email?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface ApiResponse<T> {
  message: string;
  data?: T;
  error?: string;
}
