// ===================================
// SERVICIO DE HEALTH REFACTORIZADO
// ===================================
// Servicio que usa la estructura estándar del backend

import { apiClient } from "./apiClient";
import { HealthStatus, HealthResponse } from "./types";
import { useApiCall, usePolling } from "./hooks";

// ===================================
// SERVICIO DE HEALTH
// ===================================

class HealthService {
  /**
   * Verificar salud del sistema
   */
  async checkHealth(): Promise<HealthResponse> {
    return apiClient.get<HealthStatus>("/health", { skipAuth: true });
  }
}

// ===================================
// INSTANCIA SINGLETON
// ===================================

export const healthService = new HealthService();

// ===================================
// HOOKS DE HEALTH
// ===================================

/**
 * Hook para verificación de salud manual
 */
export function useHealthCheck() {
  return useApiCall<HealthStatus>(() => healthService.checkHealth());
}

/**
 * Hook para monitoreo continuo de salud
 */
export function useHealthMonitoring(
  interval: number = 60000, // 1 minuto por defecto
  enabled: boolean = true
) {
  return usePolling<HealthStatus>(() => healthService.checkHealth(), {
    interval,
    enabled,
    onError: (error) => {
      console.warn("Health monitoring failed:", error);
    },
  });
}

// ===================================
// UTILIDADES DE HEALTH
// ===================================

export const healthUtils = {
  /**
   * Verifica si el sistema está saludable
   */
  isHealthy(status?: HealthStatus | null): boolean {
    return status?.status === "healthy";
  },

  /**
   * Obtiene el color del indicador de salud
   */
  getHealthColor(status?: HealthStatus | null): string {
    return this.isHealthy(status) ? "text-green-500" : "text-red-500";
  },

  /**
   * Obtiene el texto del estado de salud
   */
  getHealthText(status?: HealthStatus | null): string {
    return this.isHealthy(status) ? "Sistema Activo" : "Sistema Inactivo";
  },

  /**
   * Formatea la última verificación
   */
  formatLastCheck(timestamp?: string): string {
    if (!timestamp) return "Nunca";

    return new Date(timestamp).toLocaleTimeString("es-CL", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      timeZone: "America/Santiago",
    });
  },
};
