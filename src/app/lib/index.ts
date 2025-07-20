// ===================================
// ÍNDICE PRINCIPAL DE SERVICIOS
// ===================================
// Punto de entrada centralizado para todos los servicios y hooks

// ===================================
// TIPOS BASE
// ===================================
export * from "./types";

// ===================================
// CLIENTE API BASE
// ===================================
export { apiClient, ApiClientError } from "./apiClient";
export type { ApiClientConfig, RequestConfig } from "./apiClient";

// ===================================
// HOOKS GENERALES
// ===================================
export {
  useApiCall,
  useApiData,
  useMutation,
  usePaginatedData,
  usePolling,
  useDebouncedApiCall,
} from "./hooks";
export type {
  PaginatedState,
  PaginatedHookResult,
  PollingOptions,
} from "./hooks";

// ===================================
// SERVICIOS DE AUTENTICACIÓN
// ===================================
export { authService } from "./authService";
export {
  useLogin,
  useRegister,
  useProfile,
  useUpdateProfile,
  useChangePassword,
  useAuthState,
} from "./authService";
export type { AuthResult } from "./authService";

// ===================================
// SERVICIOS DE TIME-TRACKING
// ===================================
export { timeTrackingService, formatUtils } from "./timeTrackingService";
export {
  useClockIn,
  useClockOut,
  useStartLunch,
  useResumeShift,
  useCurrentStatus,
  useTodaySession,
  useRecentActivities,
  useSessions,
  useSession,
  useUpdateSession,
  useDeleteTimeEntry,
  useDashboardData,
  useTimeOperations,
} from "./timeTrackingService";
export type {
  TimeOperationParams,
  SessionFilters,
} from "./timeTrackingService";

// ===================================
// SERVICIOS DE ESTADÍSTICAS
// ===================================
export { statisticsService, statsUtils } from "./statisticsService";
export {
  useDashboardStats,
  useWeeklyStats,
  useMonthlyStats,
  useYearlyStats,
  useDetailedStats,
  useComparisonStats,
  useRankings,
  useTrends,
  useCompleteReport,
} from "./statisticsService";
export type {
  StatsFilters,
  WeeklyStats,
  MonthlyStats,
  YearlyStats,
  DetailedStats,
  ComparisonStats,
} from "./statisticsService";

// ===================================
// SERVICIOS DE HEALTH
// ===================================
export { healthService, healthUtils } from "./healthService";
export { useHealthCheck, useHealthMonitoring } from "./healthService";

// ===================================
// UTILIDADES DE ERROR
// ===================================
export {
  extractErrorMessages,
  hasFieldError,
  getFieldError,
  handleApiError,
  getAllErrorMessages,
} from "./apiClient";

// ===================================
// CONFIGURACIONES PREDETERMINADAS
// ===================================

/**
 * Intervalos de polling recomendados (en ms)
 */
export const POLLING_INTERVALS = {
  FAST: 10000, // 10 segundos - para datos críticos
  NORMAL: 30000, // 30 segundos - para datos normales
  SLOW: 60000, // 1 minuto - para datos menos críticos
  VERY_SLOW: 300000, // 5 minutos - para estadísticas
} as const;

/**
 * Configuración de paginación predeterminada
 */
export const PAGINATION_DEFAULTS = {
  LIMIT: 10,
  LIMIT_LARGE: 50,
  LIMIT_SMALL: 5,
} as const;

/**
 * Timeouts de peticiones (en ms)
 */
export const TIMEOUT_CONFIG = {
  SHORT: 5000, // 5 segundos - para operaciones rápidas
  NORMAL: 10000, // 10 segundos - para operaciones normales
  LONG: 30000, // 30 segundos - para operaciones lentas
} as const;
