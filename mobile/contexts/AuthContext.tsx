// // src/contexts/AuthContext.tsx

// import React, {
//   createContext,
//   useContext,
//   useState,
//   useEffect,
//   ReactNode,
// } from "react";
// import * as SecureStore from "expo-secure-store";
// import { fetchWithToken } from "../services/api";
// import { User } from "@/types/auth";

// interface AuthContextData {
//   user: User | null;
//   isLoading: boolean;
//   signIn: (email: string, password: string) => Promise<void>;
//   signOut: () => Promise<void>;
//   signUp: (username: string, email: string, password: string) => Promise<void>;
//   isAuthenticated: boolean;
// }

// const AuthContext = createContext<AuthContextData>({} as AuthContextData);

// export const AuthProvider: React.FC<{ children: ReactNode }> = ({
//   children,
// }) => {
//   const [user, setUser] = useState<User | null>(null);
//   const [isLoading, setIsLoading] = useState(true);

//   useEffect(() => {
//     loadStoredToken();
//   }, []);

//   async function loadStoredToken() {
//     setIsLoading(true);
//     try {
//       const token = await SecureStore.getItemAsync("auth_token");

//       if (token) {
//         const userData = await fetchWithToken("/api/auth/profile");
//         setUser(userData);
//       }
//     } catch (error) {
//       console.error("Failed to restore authentication state", error);
//       await SecureStore.deleteItemAsync("auth_token");
//     } finally {
//       setIsLoading(false);
//     }
//   }

//   async function signIn(email: string, password: string) {
//     try {
//       const response = await fetchWithToken("/api/auth/login", {
//         method: "POST",
//         body: JSON.stringify({ email, password }),
//       });

//       const { token, user } = response;

//       await SecureStore.setItemAsync("auth_token", token);
//       setUser(user);
//     } catch (error) {
//       console.error("Sign in failed", error);
//       throw error;
//     }
//   }

//   async function signUp(username: string, email: string, password: string) {
//     try {
//       const response = await fetchWithToken("/api/auth/register", {
//         method: "POST",
//         body: JSON.stringify({ username, email, password }),
//       });

//       const { token, user } = response;

//       // Store the token
//       await SecureStore.setItemAsync("auth_token", token);
//       setUser(user);
//     } catch (error) {
//       console.error("Sign up failed", error);
//       throw error;
//     }
//   }

//   async function signOut() {
//     // Remove the token
//     await SecureStore.deleteItemAsync("auth_token");
//     setUser(null);
//   }

//   return (
//     <AuthContext.Provider
//       value={{
//         user,
//         isLoading,
//         signIn,
//         signOut,
//         signUp,
//         isAuthenticated: !!user,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export function useAuth() {
//   const context = useContext(AuthContext);
//   return context;
// }
