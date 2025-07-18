import { authService } from "./auth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:9000/api";

export interface TimeEntry {
  id: string;
  type: "clock_in" | "clock_out" | "start_lunch" | "resume_shift";
  timestamp: string;
  date: string;
  timezone: string;
  isValid: boolean;
}

export interface WorkSession {
  id: number;
  userId: number;
  date: string;
  clockInTime?: string;
  clockOutTime?: string;
  lunchStartTime?: string;
  lunchEndTime?: string;
  totalWorkMinutes: number;
  totalLunchMinutes: number;
  totalWorkHours: number;
  status: "active" | "on_lunch" | "completed" | "overtime_pending";
}

export interface ButtonStates {
  clockIn: {
    enabled: boolean;
    reason?: string;
  };
  clockOut: {
    enabled: boolean;
    reason?: string;
  };
  startLunch: {
    enabled: boolean;
    reason?: string;
  };
  resumeShift: {
    enabled: boolean;
    reason?: string;
  };
}

export interface CurrentStatus {
  status: "clocked_out" | "clocked_in" | "on_lunch";
  session?: WorkSession;
  buttonStates: ButtonStates;
  canClockIn: boolean;
  canClockOut: boolean;
  canStartLunch: boolean;
  canResumeShift: boolean;
  restrictions: string[];
}

export interface TodaySession {
  session: WorkSession | null;
  workedHours: number;
  lunchDuration: number;
  remainingHours: number;
  status: "clocked_out" | "clocked_in" | "on_lunch";
  canClockIn: boolean;
  canClockOut: boolean;
  canStartLunch: boolean;
  canResumeShift: boolean;
}

export interface DashboardStats {
  weekStats: {
    totalHours: number;
    totalDays: number;
    overtimeHours: number;
  };
  monthStats: {
    totalHours: number;
    totalDays: number;
    overtimeHours: number;
  };
  averageEntryTime: string;
  averageExitTime: string;
  averageLunchDuration: number;
  complianceScore: number;
}

export interface TimeTrackingResponse {
  success: boolean;
  message: string;
  session?: WorkSession;
  entry?: TimeEntry;
  validationErrors?: string[];
  buttonStates?: ButtonStates;
  totalHours?: number;
  lunchDuration?: number;
}

// Utilidad para obtener el token del localStorage/sessionStorage
function getAuthToken(): string | null {
  return authService.getToken();
}

// Utilidad para hacer peticiones autenticadas
async function authenticatedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = getAuthToken();

  if (!token) {
    throw new Error("No hay token de autenticación");
  }

  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
    ...options.headers,
  };

  return fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });
}

// Servicios de Time Tracking
export const timeTrackingAPI = {
  // Clock In
  async clockIn(timestamp?: string): Promise<TimeTrackingResponse> {
    const response = await authenticatedFetch("/time/clock-in", {
      method: "POST",
      body: JSON.stringify({ timestamp }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Error al registrar entrada");
    }

    return response.json();
  },

  // Clock Out
  async clockOut(timestamp?: string): Promise<TimeTrackingResponse> {
    const response = await authenticatedFetch("/time/clock-out", {
      method: "POST",
      body: JSON.stringify({ timestamp }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Error al registrar salida");
    }

    return response.json();
  },

  // Start Lunch
  async startLunch(timestamp?: string): Promise<TimeTrackingResponse> {
    const response = await authenticatedFetch("/time/start-lunch", {
      method: "POST",
      body: JSON.stringify({ timestamp }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Error al iniciar almuerzo");
    }

    return response.json();
  },

  // Resume Shift
  async resumeShift(timestamp?: string): Promise<TimeTrackingResponse> {
    const response = await authenticatedFetch("/time/resume-shift", {
      method: "POST",
      body: JSON.stringify({ timestamp }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Error al reanudar turno");
    }

    return response.json();
  },

  // Get Current Status
  async getCurrentStatus(): Promise<CurrentStatus> {
    const response = await authenticatedFetch("/time/current-status");

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Error al obtener estado actual");
    }

    return response.json();
  },

  // Get Today Session
  async getTodaySession(): Promise<TodaySession> {
    const response = await authenticatedFetch("/time/today-session");

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Error al obtener sesión de hoy");
    }

    return response.json();
  },

  // Get Recent Activities
  async getRecentActivities(
    limit: number = 5
  ): Promise<{ activities: TimeEntry[] }> {
    const response = await authenticatedFetch(
      `/time/recent-activities?limit=${limit}`
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || "Error al obtener actividades recientes");
    }

    return response.json();
  },
};

// Servicios de Estadísticas
export const statisticsAPI = {
  // Get Dashboard Stats
  async getDashboardStats(): Promise<DashboardStats> {
    const response = await authenticatedFetch("/statistics/dashboard");

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        error.error || "Error al obtener estadísticas del dashboard"
      );
    }

    return response.json();
  },
};

// Utilidades para formatear datos
export const formatUtils = {
  // Formatear tiempo desde timestamp
  formatTime(timestamp: string): string {
    return new Date(timestamp).toLocaleTimeString("es-CL", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "America/Santiago",
    });
  },

  // Formatear fecha desde timestamp
  formatDate(timestamp: string): string {
    return new Date(timestamp).toLocaleDateString("es-CL", {
      timeZone: "America/Santiago",
    });
  },

  // Formatear duración en minutos a horas y minutos
  formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;

    if (hours > 0) {
      return `${hours}h ${remainingMinutes}m`;
    }
    return `${remainingMinutes}m`;
  },

  // Obtener texto de actividad
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

  // Obtener ícono de actividad
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
};
