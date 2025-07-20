// ===================================
// SERVICIO DE TIME-TRACKING REFACTORIZADO
// ===================================
// Servicio que usa la estructura estándar del backend

import { apiClient } from "./apiClient";
import {
  ApiResponse,
  TimeOperationData,
  CurrentStatusData,
  TodaySessionData,
  RecentActivitiesData,
  SessionsData,
  WorkSession,
  TimeEntry,
  ButtonStates,
  TimeOperationResponse,
  CurrentStatusResponse,
  TodaySessionResponse,
  RecentActivitiesResponse,
  SessionsResponse,
} from "./types";
import { useApiCall, useMutation, usePaginatedData, usePolling } from "./hooks";

// ===================================
// INTERFACES DEL SERVICIO
// ===================================

export interface TimeOperationParams {
  timestamp?: string;
}

export interface SessionFilters {
  startDate?: string;
  endDate?: string;
}

// ===================================
// SERVICIO DE TIME-TRACKING
// ===================================

class TimeTrackingService {
  /**
   * Registrar entrada
   */
  async clockIn(params?: TimeOperationParams): Promise<TimeOperationResponse> {
    return apiClient.post<TimeOperationData>("/time/clock-in", params);
  }

  /**
   * Registrar salida
   */
  async clockOut(params?: TimeOperationParams): Promise<TimeOperationResponse> {
    return apiClient.post<TimeOperationData>("/time/clock-out", params);
  }

  /**
   * Iniciar almuerzo
   */
  async startLunch(
    params?: TimeOperationParams
  ): Promise<TimeOperationResponse> {
    return apiClient.post<TimeOperationData>("/time/start-lunch", params);
  }

  /**
   * Reanudar turno (terminar almuerzo)
   */
  async resumeShift(
    params?: TimeOperationParams
  ): Promise<TimeOperationResponse> {
    return apiClient.post<TimeOperationData>("/time/resume-shift", params);
  }

  /**
   * Obtener estado actual del usuario
   */
  async getCurrentStatus(): Promise<CurrentStatusResponse> {
    return apiClient.get<CurrentStatusData>("/time/current-status");
  }

  /**
   * Obtener sesión del día actual
   */
  async getTodaySession(): Promise<TodaySessionResponse> {
    return apiClient.get<TodaySessionData>("/time/today-session");
  }

  /**
   * Obtener actividades recientes
   */
  async getRecentActivities(
    limit: number = 5
  ): Promise<RecentActivitiesResponse> {
    return apiClient.get<RecentActivitiesData>(
      `/time/recent-activities?limit=${limit}`
    );
  }

  /**
   * Obtener sesiones históricas con filtros y paginación
   */
  async getSessions(
    page: number = 1,
    limit: number = 10,
    filters?: SessionFilters
  ): Promise<SessionsResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (filters?.startDate) params.append("startDate", filters.startDate);
    if (filters?.endDate) params.append("endDate", filters.endDate);

    return apiClient.get<SessionsData>(`/time/sessions?${params}`);
  }

  /**
   * Obtener sesión específica por ID
   */
  async getSession(
    sessionId: number
  ): Promise<ApiResponse<{ session: WorkSession }>> {
    return apiClient.get<{ session: WorkSession }>(
      `/time/sessions/${sessionId}`
    );
  }

  /**
   * Actualizar sesión (para correcciones administrativas)
   */
  async updateSession(
    sessionId: number,
    updates: Partial<WorkSession>
  ): Promise<ApiResponse<{ session: WorkSession }>> {
    return apiClient.put<{ session: WorkSession }>(
      `/time/sessions/${sessionId}`,
      updates
    );
  }

  /**
   * Eliminar entrada de tiempo
   */
  async deleteTimeEntry(entryId: string): Promise<{ success: boolean }> {
    const response = await apiClient.delete<{ success: boolean }>(
      `/time/entries/${entryId}`
    );
    return response.data!;
  }
}

// ===================================
// INSTANCIA SINGLETON
// ===================================

export const timeTrackingService = new TimeTrackingService();

// ===================================
// HOOKS DE TIME-TRACKING
// ===================================

/**
 * Hook para registrar entrada
 */
export function useClockIn() {
  return useMutation<TimeOperationData, TimeOperationParams | undefined>(
    (params) => timeTrackingService.clockIn(params)
  );
}

/**
 * Hook para registrar salida
 */
export function useClockOut() {
  return useMutation<TimeOperationData, TimeOperationParams | undefined>(
    (params) => timeTrackingService.clockOut(params)
  );
}

/**
 * Hook para iniciar almuerzo
 */
export function useStartLunch() {
  return useMutation<TimeOperationData, TimeOperationParams | undefined>(
    (params) => timeTrackingService.startLunch(params)
  );
}

/**
 * Hook para reanudar turno
 */
export function useResumeShift() {
  return useMutation<TimeOperationData, TimeOperationParams | undefined>(
    (params) => timeTrackingService.resumeShift(params)
  );
}

/**
 * Hook para obtener estado actual
 */
export function useCurrentStatus(autoRefresh: boolean = false) {
  const hook = useApiCall<CurrentStatusData>(() =>
    timeTrackingService.getCurrentStatus()
  );

  // Opción de polling para estado en tiempo real
  const pollingHook = usePolling<CurrentStatusData>(
    () => timeTrackingService.getCurrentStatus(),
    {
      interval: 30000, // 30 segundos
      enabled: autoRefresh,
    }
  );

  return autoRefresh ? pollingHook : hook;
}

/**
 * Hook para obtener sesión del día
 */
export function useTodaySession(autoRefresh: boolean = false) {
  const hook = useApiCall<TodaySessionData>(() =>
    timeTrackingService.getTodaySession()
  );

  const pollingHook = usePolling<TodaySessionData>(
    () => timeTrackingService.getTodaySession(),
    {
      interval: 60000, // 1 minuto
      enabled: autoRefresh,
    }
  );

  return autoRefresh ? pollingHook : hook;
}

/**
 * Hook para obtener actividades recientes
 */
export function useRecentActivities(
  limit: number = 5,
  autoRefresh: boolean = false
) {
  const apiCall = () => timeTrackingService.getRecentActivities(limit);

  const hook = useApiCall<RecentActivitiesData>(apiCall);

  const pollingHook = usePolling<RecentActivitiesData>(apiCall, {
    interval: 30000, // 30 segundos
    enabled: autoRefresh,
  });

  return autoRefresh ? pollingHook : hook;
}

/**
 * Hook para obtener sesiones con paginación
 */
export function useSessions(limit: number = 10, filters?: SessionFilters) {
  return usePaginatedData<WorkSession>(
    (page, pageLimit) =>
      timeTrackingService
        .getSessions(page, pageLimit, filters)
        .then((response) => ({
          ...response,
          data: Array.isArray(response.data)
            ? response.data
            : response.data?.sessions || [],
        })),
    limit
  );
}

/**
 * Hook para obtener sesión específica
 */
export function useSession(sessionId: number) {
  return useApiCall<{ session: WorkSession }>(() =>
    timeTrackingService.getSession(sessionId)
  );
}

/**
 * Hook para actualizar sesión
 */
export function useUpdateSession() {
  return useMutation<
    { session: WorkSession },
    { sessionId: number; updates: Partial<WorkSession> }
  >(({ sessionId, updates }) =>
    timeTrackingService.updateSession(sessionId, updates)
  );
}

/**
 * Hook para eliminar entrada de tiempo
 */
export function useDeleteTimeEntry() {
  return useMutation<{ success: boolean }, string>((entryId) =>
    timeTrackingService.deleteTimeEntry(entryId)
  );
}

// ===================================
// HOOKS COMPUESTOS PARA EL DASHBOARD
// ===================================

/**
 * Hook compuesto que carga todos los datos del dashboard
 */
export function useDashboardData(autoRefresh: boolean = false) {
  const currentStatus = useCurrentStatus(autoRefresh);
  const todaySession = useTodaySession(autoRefresh);
  const recentActivities = useRecentActivities(5, autoRefresh);

  // Función para recargar todos los datos
  const refreshAll = async () => {
    await Promise.all([
      currentStatus.execute(),
      todaySession.execute(),
      recentActivities.execute(),
    ]);
  };

  return {
    currentStatus: currentStatus.data,
    todaySession: todaySession.data,
    recentActivities: recentActivities.data?.activities || [],
    loading:
      currentStatus.loading || todaySession.loading || recentActivities.loading,
    error: currentStatus.error || todaySession.error || recentActivities.error,
    refreshAll,
  };
}

/**
 * Hook para operaciones de tiempo con estado unificado
 */
export function useTimeOperations() {
  const clockIn = useClockIn();
  const clockOut = useClockOut();
  const startLunch = useStartLunch();
  const resumeShift = useResumeShift();

  // Estado unificado
  const loading =
    clockIn.loading ||
    clockOut.loading ||
    startLunch.loading ||
    resumeShift.loading;
  const error =
    clockIn.error || clockOut.error || startLunch.error || resumeShift.error;

  // Funciones simplificadas
  const handleClockIn = async (timestamp?: string) => {
    return clockIn.mutate({ timestamp });
  };

  const handleClockOut = async (timestamp?: string) => {
    return clockOut.mutate({ timestamp });
  };

  const handleStartLunch = async (timestamp?: string) => {
    return startLunch.mutate({ timestamp });
  };

  const handleResumeShift = async (timestamp?: string) => {
    return resumeShift.mutate({ timestamp });
  };

  return {
    loading,
    error,
    clockIn: handleClockIn,
    clockOut: handleClockOut,
    startLunch: handleStartLunch,
    resumeShift: handleResumeShift,
    // Estados individuales para acceso granular
    clockInState: clockIn,
    clockOutState: clockOut,
    startLunchState: startLunch,
    resumeShiftState: resumeShift,
  };
}

// ===================================
// UTILIDADES DE FORMATEO
// ===================================

export const formatUtils = {
  /**
   * Formatear tiempo desde timestamp
   */
  formatTime(timestamp: string): string {
    return new Date(timestamp).toLocaleTimeString("es-CL", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "America/Santiago",
    });
  },

  /**
   * Formatear fecha desde timestamp
   */
  formatDate(timestamp: string): string {
    return new Date(timestamp).toLocaleDateString("es-CL", {
      timeZone: "America/Santiago",
    });
  },

  /**
   * Formatear duración en minutos a horas y minutos
   */
  formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${remainingMinutes}m`;
  },

  /**
   * Obtener texto de actividad
   */
  getActivityText(type: string): string {
    switch (type) {
      case "clock_in":
        return "Entrada";
      case "clock_out":
        return "Salida";
      case "start_lunch":
        return "Inicio de almuerzo";
      case "resume_shift":
        return "Fin de almuerzo";
      default:
        return type;
    }
  },

  /**
   * Obtener ícono de actividad
   */
  getActivityIcon(type: string): string {
    switch (type) {
      case "clock_in":
        return "▶️";
      case "clock_out":
        return "⏹️";
      case "start_lunch":
        return "🥗";
      case "resume_shift":
        return "⏯️";
      default:
        return "📝";
    }
  },

  /**
   * Obtener color del estado
   */
  getStatusColor(status: string): string {
    switch (status) {
      case "clocked_in":
        return "text-green-600";
      case "on_lunch":
        return "text-yellow-600";
      case "clocked_out":
        return "text-gray-600";
      case "overtime_pending":
        return "text-orange-600";
      case "completed":
        return "text-blue-600";
      default:
        return "text-gray-600";
    }
  },

  /**
   * Formatear estado para mostrar
   */
  getStatusText(status: string): string {
    switch (status) {
      case "clocked_in":
        return "Trabajando";
      case "on_lunch":
        return "En almuerzo";
      case "clocked_out":
        return "Fuera de servicio";
      case "active":
        return "Activo";
      case "completed":
        return "Completado";
      case "overtime_pending":
        return "Horas extra pendientes";
      default:
        return status;
    }
  },
};
