"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { authService } from "../lib/auth";
import { useNotification } from "./NotificationContext";

interface User {
  id: string;
  username: string;
  name?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (
    username: string,
    password: string,
    rememberMe?: boolean
  ) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { showSuccess, showError, showInfo } = useNotification();

  useEffect(() => {
    const initAuth = () => {
      const isAuth = authService.isAuthenticated();
      setIsAuthenticated(isAuth);

      if (isAuth) {
        const userData = authService.getUserFromToken();
        setUser(userData);
      }

      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = async (
    username: string,
    password: string,
    rememberMe: boolean = false
  ): Promise<boolean> => {
    try {
      const response = await authService.login({ username, password });
      authService.setToken(response.token, rememberMe);
      setUser(response.user);
      setIsAuthenticated(true);
      showSuccess(`¡Bienvenido, ${response.user.username}!`);
      return true;
    } catch (error: any) {
      console.error("Login error:", error);
      showError(error.message || "Error al iniciar sesión");
      return false;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
    showInfo("Sesión cerrada exitosamente");
  };

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, isLoading, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
