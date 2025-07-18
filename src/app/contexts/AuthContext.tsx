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
  rut: string;
  nombre?: string;
  apellido_paterno?: string;
  apellido_materno?: string;
  email?: string;
  createdAt?: string;
  roles?: string[];
  permissions?: string[];
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (
    rut: string,
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
    rut: string,
    password: string,
    rememberMe: boolean = false
  ): Promise<boolean> => {
    const result = await authService.login({ rut, password });

    if (result.success && result.data) {
      authService.setToken(result.data.token, rememberMe);
      setUser(result.data.user);
      setIsAuthenticated(true);

      // Create a more user-friendly welcome message
      const userName = result.data.user.nombre
        ? `${result.data.user.nombre} ${
            result.data.user.apellido_paterno || ""
          }`.trim()
        : result.data.user.rut;

      showSuccess(`¡Bienvenido, ${userName}!`);
      return true;
    } else {
      showError(result.error || "Error al iniciar sesión");
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
