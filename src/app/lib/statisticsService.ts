// ===================================
// SERVICIO DE ESTADÍSTICAS REFACTORIZADO
// ===================================
// Servicio que usa la estructura estándar del backend

import { apiClient } from "./apiClient";
import {
  ApiResponse,
  DashboardStatsData,
  DashboardStatsResponse,
} from "./types";
import { useApiCall, usePolling } from "./hooks";

// ===================================
// INTERFACES DEL SERVICIO
// ===================================

export interface StatsFilters {
  startDate?: string;
  endDate?: string;
  userId?: string;
  department?: string;
}

export interface WeeklyStats {
  week: string;
  totalHours: number;
  totalDays: number;
  overtimeHours: number;
  averageHoursPerDay: number;
  complianceScore: number;
}

export interface MonthlyStats {
  month: string;
  totalHours: number;
  totalDays: number;
  overtimeHours: number;
  averageHoursPerDay: number;
  complianceScore: number;
  weeklyBreakdown: WeeklyStats[];
}

export interface YearlyStats {
  year: string;
  totalHours: number;
  totalDays: number;
  overtimeHours: number;
  averageHoursPerDay: number;
  complianceScore: number;
  monthlyBreakdown: MonthlyStats[];
}

export interface DetailedStats {
  user: {
    id: string;
    name: string;
    department?: string;
  };
  period: {
    start: string;
    end: string;
    type: "day" | "week" | "month" | "year";
  };
  totals: {
    workedHours: number;
    scheduledHours: number;
    overtimeHours: number;
    lunchHours: number;
    absenceHours: number;
  };
  averages: {
    dailyHours: number;
    entryTime: string;
    exitTime: string;
    lunchDuration: number;
  };
  compliance: {
    score: number;
    onTimeEntries: number;
    lateEntries: number;
    earlyExits: number;
    longLunches: number;
  };
  trends: {
    hoursGrowth: number;
    punctualityGrowth: number;
    consistencyScore: number;
  };
}

export interface ComparisonStats {
  current: DetailedStats;
  previous: DetailedStats;
  comparison: {
    hoursChange: number;
    daysChange: number;
    overtimeChange: number;
    complianceChange: number;
  };
}

// ===================================
// SERVICIO DE ESTADÍSTICAS
// ===================================

class StatisticsService {
  /**
   * Obtener estadísticas del dashboard
   */
  async getDashboardStats(): Promise<DashboardStatsResponse> {
    return apiClient.get<DashboardStatsData>("/statistics/dashboard");
  }

  /**
   * Obtener estadísticas semanales
   */
  async getWeeklyStats(
    filters?: StatsFilters
  ): Promise<ApiResponse<WeeklyStats>> {
    const params = new URLSearchParams();

    if (filters?.startDate) params.append("startDate", filters.startDate);
    if (filters?.endDate) params.append("endDate", filters.endDate);
    if (filters?.userId) params.append("userId", filters.userId);
    if (filters?.department) params.append("department", filters.department);

    const query = params.toString();
    const endpoint = `/statistics/weekly${query ? `?${query}` : ""}`;

    return apiClient.get<WeeklyStats>(endpoint);
  }

  /**
   * Obtener estadísticas mensuales
   */
  async getMonthlyStats(
    filters?: StatsFilters
  ): Promise<ApiResponse<MonthlyStats>> {
    const params = new URLSearchParams();

    if (filters?.startDate) params.append("startDate", filters.startDate);
    if (filters?.endDate) params.append("endDate", filters.endDate);
    if (filters?.userId) params.append("userId", filters.userId);
    if (filters?.department) params.append("department", filters.department);

    const query = params.toString();
    const endpoint = `/statistics/monthly${query ? `?${query}` : ""}`;

    return apiClient.get<MonthlyStats>(endpoint);
  }

  /**
   * Obtener estadísticas anuales
   */
  async getYearlyStats(
    filters?: StatsFilters
  ): Promise<ApiResponse<YearlyStats>> {
    const params = new URLSearchParams();

    if (filters?.startDate) params.append("startDate", filters.startDate);
    if (filters?.endDate) params.append("endDate", filters.endDate);
    if (filters?.userId) params.append("userId", filters.userId);
    if (filters?.department) params.append("department", filters.department);

    const query = params.toString();
    const endpoint = `/statistics/yearly${query ? `?${query}` : ""}`;

    return apiClient.get<YearlyStats>(endpoint);
  }

  /**
   * Obtener estadísticas detalladas
   */
  async getDetailedStats(
    filters?: StatsFilters
  ): Promise<ApiResponse<DetailedStats>> {
    const params = new URLSearchParams();

    if (filters?.startDate) params.append("startDate", filters.startDate);
    if (filters?.endDate) params.append("endDate", filters.endDate);
    if (filters?.userId) params.append("userId", filters.userId);
    if (filters?.department) params.append("department", filters.department);

    const query = params.toString();
    const endpoint = `/statistics/detailed${query ? `?${query}` : ""}`;

    return apiClient.get<DetailedStats>(endpoint);
  }

  /**
   * Obtener comparación de estadísticas
   */
  async getComparisonStats(
    currentPeriod: { start: string; end: string },
    previousPeriod: { start: string; end: string },
    userId?: string
  ): Promise<ApiResponse<ComparisonStats>> {
    const params = new URLSearchParams({
      currentStart: currentPeriod.start,
      currentEnd: currentPeriod.end,
      previousStart: previousPeriod.start,
      previousEnd: previousPeriod.end,
    });

    if (userId) params.append("userId", userId);

    return apiClient.get<ComparisonStats>(`/statistics/comparison?${params}`);
  }

  /**
   * Obtener rankings/leaderboard
   */
  async getRankings(
    type: "hours" | "punctuality" | "consistency",
    period: "week" | "month" | "year" = "month",
    department?: string
  ): Promise<
    ApiResponse<{
      rankings: Array<{
        rank: number;
        user: { id: string; name: string; department?: string };
        score: number;
        value: number;
        change: number;
      }>;
    }>
  > {
    const params = new URLSearchParams({
      type,
      period,
    });

    if (department) params.append("department", department);

    return apiClient.get(`/statistics/rankings?${params}`);
  }

  /**
   * Obtener tendencias temporales
   */
  async getTrends(
    metric: "hours" | "punctuality" | "compliance",
    period: "daily" | "weekly" | "monthly",
    duration: number = 30, // días
    userId?: string
  ): Promise<
    ApiResponse<{
      trends: Array<{
        date: string;
        value: number;
        change: number;
      }>;
      summary: {
        average: number;
        min: number;
        max: number;
        trend: "increasing" | "decreasing" | "stable";
        trendPercentage: number;
      };
    }>
  > {
    const params = new URLSearchParams({
      metric,
      period,
      duration: duration.toString(),
    });

    if (userId) params.append("userId", userId);

    return apiClient.get(`/statistics/trends?${params}`);
  }
}

// ===================================
// INSTANCIA SINGLETON
// ===================================

export const statisticsService = new StatisticsService();

// ===================================
// HOOKS DE ESTADÍSTICAS
// ===================================

/**
 * Hook para estadísticas del dashboard
 */
export function useDashboardStats(autoRefresh: boolean = false) {
  const hook = useApiCall<DashboardStatsData>(() =>
    statisticsService.getDashboardStats()
  );

  const pollingHook = usePolling<DashboardStatsData>(
    () => statisticsService.getDashboardStats(),
    {
      interval: 300000, // 5 minutos
      enabled: autoRefresh,
    }
  );

  return autoRefresh ? pollingHook : hook;
}

/**
 * Hook para estadísticas semanales
 */
export function useWeeklyStats(filters?: StatsFilters) {
  return useApiCall<WeeklyStats>(() =>
    statisticsService.getWeeklyStats(filters)
  );
}

/**
 * Hook para estadísticas mensuales
 */
export function useMonthlyStats(filters?: StatsFilters) {
  return useApiCall<MonthlyStats>(() =>
    statisticsService.getMonthlyStats(filters)
  );
}

/**
 * Hook para estadísticas anuales
 */
export function useYearlyStats(filters?: StatsFilters) {
  return useApiCall<YearlyStats>(() =>
    statisticsService.getYearlyStats(filters)
  );
}

/**
 * Hook para estadísticas detalladas
 */
export function useDetailedStats(filters?: StatsFilters) {
  return useApiCall<DetailedStats>(() =>
    statisticsService.getDetailedStats(filters)
  );
}

/**
 * Hook para comparación de estadísticas
 */
export function useComparisonStats(
  currentPeriod: { start: string; end: string },
  previousPeriod: { start: string; end: string },
  userId?: string
) {
  return useApiCall<ComparisonStats>(() =>
    statisticsService.getComparisonStats(currentPeriod, previousPeriod, userId)
  );
}

/**
 * Hook para rankings
 */
export function useRankings(
  type: "hours" | "punctuality" | "consistency",
  period: "week" | "month" | "year" = "month",
  department?: string
) {
  return useApiCall<{
    rankings: Array<{
      rank: number;
      user: { id: string; name: string; department?: string };
      score: number;
      value: number;
      change: number;
    }>;
  }>(() => statisticsService.getRankings(type, period, department));
}

/**
 * Hook para tendencias
 */
export function useTrends(
  metric: "hours" | "punctuality" | "compliance",
  period: "daily" | "weekly" | "monthly",
  duration: number = 30,
  userId?: string
) {
  return useApiCall<{
    trends: Array<{
      date: string;
      value: number;
      change: number;
    }>;
    summary: {
      average: number;
      min: number;
      max: number;
      trend: "increasing" | "decreasing" | "stable";
      trendPercentage: number;
    };
  }>(() => statisticsService.getTrends(metric, period, duration, userId));
}

// ===================================
// HOOKS COMPUESTOS PARA REPORTES
// ===================================

/**
 * Hook compuesto para reporte completo
 */
export function useCompleteReport(
  period: "week" | "month" | "year",
  filters?: StatsFilters
) {
  const dashboardStats = useDashboardStats(false);

  const weeklyStats = useWeeklyStats(filters);
  const monthlyStats = useMonthlyStats(filters);
  const yearlyStats = useYearlyStats(filters);

  const detailedStats = useDetailedStats(filters);

  // Seleccionar estadísticas según el período
  const periodStats =
    period === "week"
      ? weeklyStats
      : period === "month"
      ? monthlyStats
      : yearlyStats;

  const loading =
    dashboardStats.loading || periodStats.loading || detailedStats.loading;
  const error =
    dashboardStats.error || periodStats.error || detailedStats.error;

  const refreshAll = async () => {
    await Promise.all([
      dashboardStats.execute(),
      periodStats.execute(),
      detailedStats.execute(),
    ]);
  };

  return {
    dashboard: dashboardStats.data,
    period: periodStats.data,
    detailed: detailedStats.data,
    loading,
    error,
    refreshAll,
  };
}

// ===================================
// UTILIDADES DE FORMATEO
// ===================================

export const statsUtils = {
  /**
   * Formatear horas con decimales
   */
  formatHours(hours: number): string {
    return `${hours.toFixed(1)}h`;
  },

  /**
   * Formatear porcentaje
   */
  formatPercentage(value: number): string {
    return `${Math.round(value)}%`;
  },

  /**
   * Formatear cambio con signo
   */
  formatChange(change: number, isPercentage: boolean = true): string {
    const sign = change >= 0 ? "+" : "";
    const suffix = isPercentage ? "%" : "";
    return `${sign}${change.toFixed(1)}${suffix}`;
  },

  /**
   * Obtener color del cambio
   */
  getChangeColor(change: number): string {
    if (change > 0) return "text-green-600";
    if (change < 0) return "text-red-600";
    return "text-gray-600";
  },

  /**
   * Obtener color del score de compliance
   */
  getComplianceColor(score: number): string {
    if (score >= 90) return "text-green-600";
    if (score >= 75) return "text-yellow-600";
    if (score >= 60) return "text-orange-600";
    return "text-red-600";
  },

  /**
   * Formatear tiempo promedio
   */
  formatAverageTime(time: string): string {
    if (!time) return "--:--";
    return time;
  },

  /**
   * Obtener descripción de tendencia
   */
  getTrendDescription(trend: "increasing" | "decreasing" | "stable"): string {
    switch (trend) {
      case "increasing":
        return "Tendencia al alza";
      case "decreasing":
        return "Tendencia a la baja";
      case "stable":
        return "Tendencia estable";
      default:
        return "Sin tendencia definida";
    }
  },
};
