// ===================================
// CLIENTE API BASE
// ===================================
// Cliente unificado que maneja la estructura estándar del backend

import { ApiResponse, ApiError } from "./types";

// Configuración de la API
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001/api";

// ===================================
// TIPOS PARA EL CLIENTE
// ===================================

export interface ApiClientConfig {
  baseUrl?: string;
  defaultHeaders?: Record<string, string>;
  timeout?: number;
}

export interface RequestConfig extends RequestInit {
  timeout?: number;
  skipAuth?: boolean;
}

export class ApiClientError extends Error {
  public statusCode: number;
  public apiErrors?: ApiError[];
  public fieldErrors: Record<string, string>;

  constructor(message: string, statusCode: number, apiErrors?: ApiError[]) {
    super(message);
    this.name = "ApiClientError";
    this.statusCode = statusCode;
    this.apiErrors = apiErrors;
    this.fieldErrors = {};

    // Procesar errores por campo
    if (apiErrors) {
      apiErrors.forEach((error) => {
        if (error.field) {
          this.fieldErrors[error.field] = error.message;
        }
      });
    }
  }
}

// ===================================
// CLIENTE API BASE
// ===================================

export class ApiClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;
  private timeout: number;

  constructor(config: ApiClientConfig = {}) {
    this.baseUrl = config.baseUrl || API_BASE_URL;
    this.defaultHeaders = {
      "Content-Type": "application/json",
      ...config.defaultHeaders,
    };
    this.timeout = config.timeout || 10000; // 10 segundos por defecto
  }

  /**
   * Obtiene el token de autenticación desde localStorage o sessionStorage
   */
  private getAuthToken(): string | null {
    if (typeof window === "undefined") return null;

    return (
      localStorage.getItem("authToken") || sessionStorage.getItem("authToken")
    );
  }

  /**
   * Prepara los headers para la petición
   */
  private prepareHeaders(config: RequestConfig = {}): Record<string, string> {
    const headers: Record<string, string> = {
      ...this.defaultHeaders,
      ...((config.headers as Record<string, string>) || {}),
    };

    // Agregar token de autenticación si no se especifica skipAuth
    if (!config.skipAuth) {
      const token = this.getAuthToken();
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  /**
   * Maneja timeouts en las peticiones
   */
  private withTimeout(
    promise: Promise<Response>,
    timeout: number
  ): Promise<Response> {
    return Promise.race([
      promise,
      new Promise<Response>((_, reject) => {
        setTimeout(() => reject(new Error("Request timeout")), timeout);
      }),
    ]);
  }

  /**
   * Procesa la respuesta del servidor
   */
  private async processResponse<T>(
    response: Response
  ): Promise<ApiResponse<T>> {
    let responseData: any;

    try {
      responseData = await response.json();
    } catch (error) {
      throw new ApiClientError(
        "Invalid JSON response from server",
        response.status
      );
    }

    // Si la respuesta HTTP no es exitosa
    if (!response.ok) {
      // Si ya viene en formato ApiResponse con errores
      if (
        responseData &&
        typeof responseData === "object" &&
        "success" in responseData
      ) {
        throw new ApiClientError(
          responseData.message || `HTTP ${response.status}`,
          response.status,
          responseData.errors
        );
      }

      // Si viene en formato de error legacy
      throw new ApiClientError(
        responseData?.error ||
          responseData?.message ||
          `HTTP ${response.status}`,
        response.status
      );
    }

    // Si la respuesta ya está en formato ApiResponse
    if (
      responseData &&
      typeof responseData === "object" &&
      "success" in responseData
    ) {
      return responseData as ApiResponse<T>;
    }

    // Si viene en formato legacy (sin estructura ApiResponse)
    // Lo convertimos al formato estándar
    return {
      success: true,
      data: responseData as T,
      meta: {
        timestamp: new Date().toISOString(),
        version: "fallback", // Versión por defecto hasta que el backend la proporcione
      },
    } as ApiResponse<T>;
  }

  /**
   * Realiza una petición HTTP genérica
   */
  private async request<T>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = this.prepareHeaders(config);
    const timeout = config.timeout || this.timeout;

    const requestConfig: RequestInit = {
      ...config,
      headers,
    };

    try {
      const response = await this.withTimeout(
        fetch(url, requestConfig),
        timeout
      );

      return await this.processResponse<T>(response);
    } catch (error) {
      if (error instanceof ApiClientError) {
        throw error;
      }

      if (error instanceof Error) {
        if (error.message === "Request timeout") {
          throw new ApiClientError("Request timeout", 408);
        }

        if (
          error.message.includes("Failed to fetch") ||
          error.message.includes("NetworkError")
        ) {
          throw new ApiClientError(
            "Network error. Please check your connection.",
            0
          );
        }
      }

      throw new ApiClientError("Unknown error occurred", 500);
    }
  }

  // ===================================
  // MÉTODOS HTTP PÚBLICOS
  // ===================================

  /**
   * Petición GET
   */
  async get<T>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: "GET",
    });
  }

  /**
   * Petición POST
   */
  async post<T>(
    endpoint: string,
    data?: any,
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * Petición PUT
   */
  async put<T>(
    endpoint: string,
    data?: any,
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * Petición PATCH
   */
  async patch<T>(
    endpoint: string,
    data?: any,
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: "PATCH",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * Petición DELETE
   */
  async delete<T>(
    endpoint: string,
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      ...config,
      method: "DELETE",
    });
  }

  // ===================================
  // MÉTODOS DE UTILIDAD
  // ===================================

  /**
   * Configura el URL base
   */
  setBaseUrl(url: string): void {
    this.baseUrl = url;
  }

  /**
   * Configura headers por defecto
   */
  setDefaultHeaders(headers: Record<string, string>): void {
    this.defaultHeaders = { ...this.defaultHeaders, ...headers };
  }

  /**
   * Configura timeout por defecto
   */
  setTimeout(timeout: number): void {
    this.timeout = timeout;
  }

  /**
   * Verifica si hay un token de autenticación válido
   */
  hasAuthToken(): boolean {
    return !!this.getAuthToken();
  }
}

// ===================================
// INSTANCIA SINGLETON
// ===================================

export const apiClient = new ApiClient();

// ===================================
// UTILIDADES PARA MANEJO DE ERRORES
// ===================================

/**
 * Extrae mensajes de error de una respuesta
 * Prioriza los mensajes específicos del array errors
 */
export function extractErrorMessages(error: unknown): {
  message: string;
  fieldErrors: Record<string, string>;
} {
  if (error instanceof ApiClientError) {
    // Si hay errores específicos, priorizar el primer mensaje específico
    let message = error.message;
    if (error.apiErrors && error.apiErrors.length > 0) {
      message = error.apiErrors[0].message;
    }

    return {
      message,
      fieldErrors: error.fieldErrors,
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      fieldErrors: {},
    };
  }

  return {
    message: "An unknown error occurred",
    fieldErrors: {},
  };
}

/**
 * Verifica si un error es de tipo de campo específico
 */
export function hasFieldError(error: unknown, field: string): boolean {
  if (error instanceof ApiClientError) {
    return field in error.fieldErrors;
  }
  return false;
}

/**
 * Obtiene el mensaje de error de un campo específico
 */
export function getFieldError(error: unknown, field: string): string | null {
  if (error instanceof ApiClientError) {
    return error.fieldErrors[field] || null;
  }
  return null;
}

/**
 * Función utilitaria para manejar errores de manera consistente
 * Extrae el mensaje exacto del backend sin modificarlo
 * Prioriza los mensajes específicos del array errors sobre el mensaje general
 */
export function handleApiError(
  error: unknown,
  fallbackMessage?: string
): string {
  // Si es un ApiClientError, verificar si hay errores específicos
  if (
    error instanceof ApiClientError &&
    error.apiErrors &&
    error.apiErrors.length > 0
  ) {
    // Retornar el primer mensaje específico del array errors
    return error.apiErrors[0].message;
  }

  // Si no hay errores específicos, usar el mensaje general
  const { message } = extractErrorMessages(error);
  return message || fallbackMessage || "Ha ocurrido un error inesperado";
}

/**
 * Función para obtener todos los mensajes de error específicos
 * Útil cuando necesitas mostrar múltiples errores de validación
 */
export function getAllErrorMessages(error: unknown): string[] {
  if (
    error instanceof ApiClientError &&
    error.apiErrors &&
    error.apiErrors.length > 0
  ) {
    return error.apiErrors.map((err) => err.message);
  }

  // Si no hay errores específicos, retornar el mensaje general como array
  const { message } = extractErrorMessages(error);
  return message ? [message] : [];
}
