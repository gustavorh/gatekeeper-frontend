// ===================================
// SERVICIO DE AUTENTICACIÓN REFACTORIZADO
// ===================================
// Servicio que usa la estructura estándar del backend

import { apiClient } from "./apiClient";
import {
  LoginRequest,
  LoginData,
  User,
  LoginResponse,
  RegisterResponse,
} from "./types";

// ===================================
// INTERFACES DEL SERVICIO
// ===================================

export interface AuthResult {
  success: boolean;
  data?: LoginData;
  error?: string;
  fieldErrors?: Record<string, string>;
}

// ===================================
// SERVICIO DE AUTENTICACIÓN
// ===================================

class AuthService {
  private tokenKey = "authToken";
  private userKey = "userData";

  /**
   * Inicia sesión de usuario
   */
  async login(credentials: LoginRequest): Promise<AuthResult> {
    try {
      const response = await apiClient.post<LoginData>(
        "/auth/login",
        credentials,
        {
          skipAuth: true, // No necesita autenticación previa
        }
      );

      if (response.success && response.data) {
        return {
          success: true,
          data: response.data,
        };
      } else {
        return {
          success: false,
          error: response.message || "Login failed",
          fieldErrors: {},
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Network error occurred",
        fieldErrors: error.fieldErrors || {},
      };
    }
  }

  /**
   * Registra un nuevo usuario
   */
  async register(credentials: LoginRequest): Promise<AuthResult> {
    try {
      const response = await apiClient.post<LoginData>(
        "/auth/register",
        credentials,
        {
          skipAuth: true,
        }
      );

      if (response.success && response.data) {
        return {
          success: true,
          data: response.data,
        };
      } else {
        return {
          success: false,
          error: response.message || "Registration failed",
          fieldErrors: {},
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Network error occurred",
        fieldErrors: error.fieldErrors || {},
      };
    }
  }

  /**
   * Guarda el token de autenticación
   */
  setToken(token: string, remember: boolean = false): void {
    if (typeof window === "undefined") return;

    const storage = remember ? localStorage : sessionStorage;
    storage.setItem(this.tokenKey, token);

    // Limpiar del otro storage si existe
    const otherStorage = remember ? sessionStorage : localStorage;
    otherStorage.removeItem(this.tokenKey);
  }

  /**
   * Obtiene el token de autenticación
   */
  getToken(): string | null {
    if (typeof window === "undefined") return null;

    return (
      localStorage.getItem(this.tokenKey) ||
      sessionStorage.getItem(this.tokenKey)
    );
  }

  /**
   * Guarda los datos del usuario
   */
  setUser(user: User): void {
    if (typeof window === "undefined") return;

    // Guardar en el mismo storage que el token
    const hasTokenInLocal = localStorage.getItem(this.tokenKey);
    const storage = hasTokenInLocal ? localStorage : sessionStorage;

    storage.setItem(this.userKey, JSON.stringify(user));
  }

  /**
   * Obtiene los datos del usuario desde el storage
   */
  getStoredUser(): User | null {
    if (typeof window === "undefined") return null;

    const userData =
      localStorage.getItem(this.userKey) ||
      sessionStorage.getItem(this.userKey);

    if (!userData) return null;

    try {
      return JSON.parse(userData);
    } catch {
      return null;
    }
  }

  /**
   * Obtiene los datos del usuario desde el token JWT
   */
  getUserFromToken(): User | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.user || payload; // Dependiendo del formato del JWT
    } catch {
      return null;
    }
  }

  /**
   * Obtiene el usuario actual (primero desde storage, luego desde token)
   */
  getCurrentUser(): User | null {
    return this.getStoredUser() || this.getUserFromToken();
  }

  /**
   * Verifica si el usuario está autenticado
   */
  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) {
      return false;
    }

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));

      // Si no hay campo exp, asumir que el token es válido
      if (!payload.exp) {
        return true;
      }

      const exp = payload.exp * 1000; // Convertir a ms
      const now = Date.now();
      const isValid = now < exp;

      // Log solo si el token está próximo a expirar (menos de 10 minutos)
      if (!isValid || exp - now < 10 * 60 * 1000) {
        console.log("⚠️ Token status:", {
          isValid,
          remainingTime: Math.round((exp - now) / 1000 / 60) + " minutes",
        });
      }

      return isValid;
    } catch (error) {
      console.error("❌ Token validation error:", error);
      return false;
    }
  }

  /**
   * Verifica si el token está próximo a expirar
   */
  isTokenExpiringSoon(threshold: number = 5 * 60 * 1000): boolean {
    const token = this.getToken();
    if (!token) return true;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const exp = payload.exp * 1000;
      return exp - Date.now() < threshold;
    } catch {
      return true;
    }
  }

  /**
   * Cierra la sesión del usuario
   */
  logout(): void {
    if (typeof window === "undefined") return;

    // Limpiar tokens y datos de usuario
    localStorage.removeItem(this.tokenKey);
    sessionStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.userKey);
    sessionStorage.removeItem(this.userKey);
  }

  /**
   * Refresca el token de autenticación
   */
  async refreshToken(): Promise<boolean> {
    try {
      const response = await apiClient.post<{ token: string }>("/auth/refresh");

      if (response.success && response.data?.token) {
        // Mantener el mismo tipo de almacenamiento
        const remember = !!localStorage.getItem(this.tokenKey);
        this.setToken(response.data.token, remember);
        return true;
      }

      return false;
    } catch {
      return false;
    }
  }

  /**
   * Obtiene el perfil del usuario desde el servidor
   */
  async getProfile(): Promise<User | null> {
    try {
      const response = await apiClient.get<User>("/auth/profile");

      if (response.success && response.data) {
        this.setUser(response.data);
        return response.data;
      }

      return null;
    } catch {
      return null;
    }
  }

  /**
   * Actualiza el perfil del usuario
   */
  async updateProfile(userData: Partial<User>): Promise<AuthResult> {
    try {
      const response = await apiClient.put<User>("/auth/profile", userData);

      if (response.success && response.data) {
        this.setUser(response.data);
        return {
          success: true,
          data: { token: this.getToken()!, user: response.data },
        };
      } else {
        return {
          success: false,
          error: response.message || "Profile update failed",
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Network error occurred",
        fieldErrors: error.fieldErrors || {},
      };
    }
  }

  /**
   * Cambia la contraseña del usuario
   */
  async changePassword(
    currentPassword: string,
    newPassword: string
  ): Promise<AuthResult> {
    try {
      const response = await apiClient.put<{}>("/auth/change-password", {
        currentPassword,
        newPassword,
      });

      if (response.success) {
        return {
          success: true,
        };
      } else {
        return {
          success: false,
          error: response.message || "Password change failed",
        };
      }
    } catch (error: any) {
      return {
        success: false,
        error: error.message || "Network error occurred",
        fieldErrors: error.fieldErrors || {},
      };
    }
  }
}

// ===================================
// INSTANCIA SINGLETON
// ===================================

export const authService = new AuthService();

// ===================================
// HOOKS DE AUTENTICACIÓN
// ===================================

import { useMutation, useApiCall } from "./hooks";
import { useState, useEffect } from "react";

/**
 * Hook para el proceso de login
 */
export function useLogin() {
  return useMutation<LoginData, LoginRequest>((credentials) =>
    apiClient.post("/auth/login", credentials, { skipAuth: true })
  );
}

/**
 * Hook para el proceso de registro
 */
export function useRegister() {
  return useMutation<LoginData, LoginRequest>((credentials) =>
    apiClient.post("/auth/register", credentials, { skipAuth: true })
  );
}

/**
 * Hook para obtener el perfil actual
 */
export function useProfile() {
  return useApiCall<User>(() => apiClient.get("/auth/profile"));
}

/**
 * Hook para actualizar perfil
 */
export function useUpdateProfile() {
  return useMutation<User, Partial<User>>((userData) =>
    apiClient.put("/auth/profile", userData)
  );
}

/**
 * Hook para cambio de contraseña
 */
export function useChangePassword() {
  return useMutation<{}, { currentPassword: string; newPassword: string }>(
    (passwords) => apiClient.put("/auth/change-password", passwords)
  );
}

/**
 * Hook para estado de autenticación
 */
export function useAuthState() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const authenticated = authService.isAuthenticated();
      const currentUser = authService.getCurrentUser();

      setIsAuthenticated(authenticated);
      setUser(currentUser);
      setIsLoading(false);
    };

    checkAuth();

    // Verificar autenticación cada minuto
    const interval = setInterval(checkAuth, 60000);

    return () => clearInterval(interval);
  }, []);

  return {
    isAuthenticated,
    user,
    isLoading,
  };
}
