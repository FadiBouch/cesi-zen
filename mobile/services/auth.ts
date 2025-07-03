// services/authService.ts
import { fetchWithToken } from "./api";
import { AuthResponse, RegisterData } from "../types/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

interface LoginCredentials {
  username: string;
  password: string;
}

export const login = async (
  credentials: LoginCredentials
): Promise<AuthResponse> => {
  const response = await fetchWithToken("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });

  await AsyncStorage.setItem("auth_token", response.token);
  console.log(`login() response : ${response}`);
  return response;
};

export const register = async (data: RegisterData): Promise<AuthResponse> => {
  const response = await fetchWithToken("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });

  console.log("response : ", response.headers);
  console.log("JSON.stringifty(response)", JSON.stringify(response.headers));

  const loginBody = { username: data.username, password: data.password };

  const loginResponse = await fetchWithToken("/auth/login", {
    method: "POST",
    body: JSON.stringify(loginBody),
  });

  await AsyncStorage.setItem("auth_token", loginResponse.token);
  return response;
};

export const logout = async (): Promise<void> => {
  await AsyncStorage.removeItem("auth_token");
};

export const checkAuth = async (): Promise<boolean> => {
  try {
    const token = await AsyncStorage.getItem("auth_token");

    if (!token) {
      console.log("No token found");
      return false;
    }
    await fetchWithToken("/auth/profile");

    console.log("Token is valid");
    return true;
  } catch (error: any) {
    console.log("Token validation failed:", error);

    // Si le token est invalide (403 ou autre erreur d'auth), on le supprime
    if (error.status === 403 || error.status === 401) {
      await AsyncStorage.removeItem("auth_token");
      console.log("Invalid token removed from storage");
    }

    return false;
  }
};

export const getCurrentUser = async () => {
  return fetchWithToken("/auth/profile");
};
