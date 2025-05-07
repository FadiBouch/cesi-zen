import { fetchWithToken } from "./api";
import { AuthResponse, LoginCredentials, RegisterData } from "../types/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

export const login = async (
  credentials: LoginCredentials
): Promise<AuthResponse> => {
  const response = await fetchWithToken("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });

  await AsyncStorage.setItem("auth_token", response.token);
  return response;
};

export const register = async (data: RegisterData): Promise<AuthResponse> => {
  const response = await fetchWithToken("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });

  await AsyncStorage.setItem("auth_token", response.token);
  return response;
};

export const logout = async (): Promise<void> => {
  await AsyncStorage.removeItem("auth_token");
};

export const checkAuth = async (): Promise<boolean> => {
  const token = await AsyncStorage.getItem("auth_token");
  return !!token;
};

export const getCurrentUser = async () => {
  return fetchWithToken("/auth/me");
};
