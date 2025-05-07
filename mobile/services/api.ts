import { AuthResponse, LoginCredentials, RegisterData } from "../types/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = process.env.EXPO_BASE_URL; // À remplacer par votre URL d'API

export const fetchWithToken = async (
  endpoint: string,
  options: RequestInit = {}
) => {
  const token = await AsyncStorage.getItem("auth_token");

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const config = {
    ...options,
    headers,
  };

  const response = await fetch(`${API_URL}${endpoint}`, config);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Une erreur est survenue");
  }

  return response.json();
};
