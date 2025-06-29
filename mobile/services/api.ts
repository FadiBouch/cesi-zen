import { AuthResponse, LoginCredentials, RegisterData } from "../types/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = process.env.EXPO_PUBLIC_BASE_URL;

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

  console.log(
    `calling ${API_URL}${endpoint}\nconfig : ${JSON.stringify(config)}`
  );

  const response = await fetch(`${API_URL}${endpoint}`, config);

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || "Une erreur est survenue");
  }

  return response.json();
};

// export const fetchWithToken = async (
//   endpoint: string,
//   options: RequestInit = {}
// ) => {
//   try {
//     console.log("=== API Debug Info ===");
//     console.log("API_URL:", API_URL);
//     console.log("Endpoint:", endpoint);
//     console.log("Full URL:", `${API_URL}${endpoint}`);

//     const token = await AsyncStorage.getItem("auth_token");
//     console.log("Token exists:", !!token);

//     const headers = {
//       "Content-Type": "application/json",
//       ...(token ? { Authorization: `Bearer ${token}` } : {}),
//       ...options.headers,
//     };

//     const config = {
//       ...options,
//       headers,
//     };

//     console.log("Request config:", JSON.stringify(config, null, 2));
//     console.log("=== End Debug Info ===");

//     const response = await fetch(`${API_URL}${endpoint}`, config);

//     console.log("Response status:", response.status);
//     console.log("Response ok:", response.ok);

//     if (!response.ok) {
//       const errorData = await response.json().catch(() => ({}));
//       console.error("API Error:", errorData);
//       throw new Error(errorData.message || "Une erreur est survenue");
//     }

//     const data = await response.json();
//     console.log("Response data:", data);
//     return data;
//   } catch (error) {
//     console.error("fetchWithToken error:", error);
//     throw error;
//   }
// };
