"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { authService } from "../lib/authService";
import { useNotification } from "./NotificationContext";
import { User } from "../lib/types";

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
  refreshProfile: () => Promise<void>;
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
        const userData = authService.getCurrentUser();
        setUser(userData);
      } else {
        setUser(null);
      }

      setIsLoading(false);
    };

    initAuth();

    // Verificar autenticación periódicamente
    const interval = setInterval(() => {
      const isAuth = authService.isAuthenticated();

      if (!isAuth && isAuthenticated) {
        // Token expirado
        logout();
        showError(
          "Tu sesión ha expirado. Por favor, inicia sesión nuevamente."
        );
      }
    }, 300000); // Cada 5 minutos

    return () => clearInterval(interval);
  }, [isAuthenticated]); // Agregar dependencia

  const login = async (
    rut: string,
    password: string,
    rememberMe: boolean = false
  ): Promise<boolean> => {
    try {
      setIsLoading(true);
      const result = await authService.login({ rut, password });

      if (result.success && result.data) {
        authService.setToken(result.data.token, rememberMe);
        authService.setUser(result.data.user);
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
        // Mostrar errores por campo si existen
        if (result.fieldErrors && Object.keys(result.fieldErrors).length > 0) {
          Object.values(result.fieldErrors).forEach((error) => {
            showError(error);
          });
        } else {
          showError(result.error || "Error al iniciar sesión");
        }
        return false;
      }
    } catch (error) {
      showError("Error de conexión. Verifica tu conexión a internet.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
    showInfo("Sesión cerrada exitosamente");
  };

  const refreshProfile = async () => {
    try {
      if (!isAuthenticated) return;

      const userData = await authService.getProfile();
      if (userData) {
        setUser(userData);
      }
    } catch (error) {
      console.error("Error refreshing profile:", error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        logout,
        refreshProfile,
      }}
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
