// ===================================
// TIPOS BASE DE RESPUESTA DE LA API
// ===================================
// Basados en la estructura estándar del backend definida en CLIENT_INTEGRATION_EXAMPLES.md

/**
 * Estructura estándar de paginación que retorna el backend
 */
export interface ApiPagination {
  currentPage?: number;
  totalPages?: number;
  total?: number;
  limit?: number;
  offset?: number;
  hasMore?: boolean;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
}

/**
 * Metadata que acompaña las respuestas del backend
 */
export interface ApiMeta {
  timestamp: string;
  version: string;
  pagination?: ApiPagination;
}

/**
 * Estructura de error por campo para validaciones
 */
export interface ApiError {
  field?: string;
  code?: string;
  message: string;
}

/**
 * Estructura estándar de todas las respuestas del backend
 * Genérica para permitir tipado específico de datos
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  meta?: ApiMeta;
  errors?: ApiError[];
}

// ===================================
// TIPOS DE DOMINIO ESPECÍFICO
// ===================================

/**
 * Usuario autenticado
 */
export interface User {
  id: number;
  rut: string;
  nombre?: string;
  apellido_paterno?: string;
  apellido_materno?: string;
  email?: string;
  createdAt?: Date;
  roles?: string[];
  permissions?: string[];
}

/**
 * Datos de respuesta del login
 */
export interface LoginData {
  token: string;
  user: User;
}

/**
 * Credenciales de login
 */
export interface LoginRequest {
  rut: string;
  password: string;
}

/**
 * Estado de salud del sistema
 */
export interface HealthStatus {
  status: "healthy" | "unhealthy";
  timestamp: string;
  service: string;
  version: string;
}

/**
 * Entrada de tiempo registrada
 */
export interface TimeEntry {
  id: string;
  type: "clock_in" | "clock_out" | "start_lunch" | "resume_shift";
  timestamp: string;
  date: string;
  timezone: string;
  isValid: boolean;
}

/**
 * Sesión de trabajo
 */
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
  isOvertimeDay: boolean;
  overtimeMinutes: number;
  isValidSession: boolean;
  validationErrors?: string[] | null;
}

/**
 * Estados de botones del tiempo
 */
export interface ButtonState {
  enabled: boolean;
  reason?: string;
}

export interface ButtonStates {
  clockIn: ButtonState;
  clockOut: ButtonState;
  startLunch: ButtonState;
  resumeShift: ButtonState;
}

/**
 * Estado actual del usuario
 */
export interface CurrentStatusData {
  status: "clocked_out" | "clocked_in" | "on_lunch";
  session?: WorkSession;
  buttonStates: ButtonStates;
  canClockIn: boolean;
  canClockOut: boolean;
  canStartLunch: boolean;
  canResumeShift: boolean;
  restrictions: string[];
}

/**
 * Sesión del día actual
 */
export interface TodaySessionData {
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

/**
 * Estadísticas del dashboard
 */
export interface DashboardStatsData {
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

/**
 * Respuesta de operaciones de tiempo
 */
export interface TimeOperationData {
  session?: WorkSession;
  entry?: TimeEntry;
  validationErrors?: string[];
  buttonStates?: ButtonStates;
  totalHours?: number;
  lunchDuration?: number;
}

/**
 * Lista de actividades recientes
 */
export interface RecentActivitiesData {
  activities: TimeEntry[];
}

/**
 * Lista de sesiones con paginación
 */
export interface SessionsData {
  sessions: WorkSession[];
}

// ===================================
// TIPOS DE RESPUESTA ESPECÍFICAS
// ===================================

// Respuestas de autenticación
export type LoginResponse = ApiResponse<LoginData>;
export type RegisterResponse = ApiResponse<LoginData>;

// Respuestas de health
export type HealthResponse = ApiResponse<HealthStatus>;

// Respuestas de tiempo
export type TimeOperationResponse = ApiResponse<TimeOperationData>;
export type CurrentStatusResponse = ApiResponse<CurrentStatusData>;
export type TodaySessionResponse = ApiResponse<TodaySessionData>;
export type RecentActivitiesResponse = ApiResponse<RecentActivitiesData>;
export type SessionsResponse = ApiResponse<SessionsData>;

// Respuestas de estadísticas
export type DashboardStatsResponse = ApiResponse<DashboardStatsData>;

// ===================================
// TIPOS PARA HOOKS
// ===================================

/**
 * Estado base para hooks de API
 */
export interface ApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  fieldErrors: Record<string, string>;
}

/**
 * Funciones de resultado de hooks
 */
export interface ApiHookResult<T> extends ApiState<T> {
  execute: () => Promise<void>;
  reset: () => void;
}

// ===================================
// TIPOS PARA ADMINISTRACIÓN DE USUARIOS
// ===================================

/**
 * Detalle de rol asignado a un usuario
 */
export interface UserRoleDetail {
  roleId: number;
  roleName: string;
  roleDescription?: string | null;
  assignedAt: Date;
}

/**
 * Usuario con roles incluidos
 */
export interface UserWithRoles extends Omit<User, "roles"> {
  roles: UserRoleDetail[];
}

/**
 * Respuesta de lista de usuarios
 */
export interface UsersListData {
  users: UserWithRoles[];
  total: number;
}

/**
 * Respuesta de roles de usuario
 */
export interface UserRolesData {
  userId: number;
  roles: UserRolePermission[];
}

/**
 * Rol con permisos incluidos
 */
export interface UserRolePermission {
  roleId: number;
  roleName: string;
  roleDescription?: string | null;
  permissions: string[];
  assignedAt: Date;
  isActive: boolean;
}

/**
 * Rol del sistema
 */
export interface SystemRole {
  id: number;
  name: string;
  description: string;
  permissions: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Respuesta de roles del sistema
 */
export interface RolesListResponseData {
  roles: SystemRole[];
  total: number;
}

/**
 * Solicitud para asignar rol
 */
export interface AssignRoleRequest {
  roleId: number;
}

/**
 * Respuesta de asignación de rol
 */
export interface AssignRoleResponseData {
  success: boolean;
  message: string;
}

/**
 * Solicitud para remover rol
 */
export interface RemoveRoleRequest {
  roleId: number;
}

/**
 * Respuesta de remoción de rol
 */
export interface RemoveRoleResponseData {
  success: boolean;
  message: string;
}

// ===================================
// TIPOS DE RESPUESTA PARA ADMINISTRACIÓN
// ===================================

// Respuestas de administración de usuarios
export type UsersListResponse = ApiResponse<UserWithRoles[]>;
export type UserRolesResponse = ApiResponse<UserRolesData>;
export type AssignRoleResponse = ApiResponse<AssignRoleResponseData>;
export type RemoveRoleResponse = ApiResponse<RemoveRoleResponseData>;
export type RolesListResponse = ApiResponse<RolesListResponseData>;
