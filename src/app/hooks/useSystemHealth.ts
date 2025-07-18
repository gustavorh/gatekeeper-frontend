import { useState, useEffect, useCallback } from "react";
import { healthAPI, type HealthStatus } from "../lib/api";

interface SystemHealthState {
  isHealthy: boolean;
  status: HealthStatus | null;
  lastCheck: Date | null;
  isChecking: boolean;
  error: string | null;
}

export const useSystemHealth = (checkInterval: number = 60000) => {
  const [state, setState] = useState<SystemHealthState>({
    isHealthy: false,
    status: null,
    lastCheck: null,
    isChecking: false,
    error: null,
  });

  const checkHealth = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isChecking: true, error: null }));

      const healthStatus = await healthAPI.getHealth();

      setState((prev) => ({
        ...prev,
        isHealthy: healthStatus.status === "healthy",
        status: healthStatus,
        lastCheck: new Date(),
        isChecking: false,
        error: null,
      }));
    } catch (error) {
      console.error("Error checking system health:", error);

      setState((prev) => ({
        ...prev,
        isHealthy: false,
        status: null,
        lastCheck: new Date(),
        isChecking: false,
        error: error instanceof Error ? error.message : "Error desconocido",
      }));
    }
  }, []);

  useEffect(() => {
    // Hacer el primer check inmediatamente
    checkHealth();

    // Configurar el intervalo para checks periódicos
    const interval = setInterval(checkHealth, checkInterval);

    // Cleanup del intervalo cuando el componente se desmonta
    return () => clearInterval(interval);
  }, [checkHealth, checkInterval]);

  const forceCheck = useCallback(() => {
    checkHealth();
  }, [checkHealth]);

  return {
    isHealthy: state.isHealthy,
    status: state.status,
    lastCheck: state.lastCheck,
    isChecking: state.isChecking,
    error: state.error,
    forceCheck,
  };
};
