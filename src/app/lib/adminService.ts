// ===================================
// SERVICIO DE ADMINISTRACIÓN
// ===================================
// Servicio para operaciones administrativas

import { apiClient } from "./apiClient";
import {
  UserWithRoles,
  UserRolesData,
  AssignRoleRequest,
  RemoveRoleRequest,
  UsersListResponse,
  UserRolesResponse,
  AssignRoleResponse,
  RemoveRoleResponse,
  AssignRoleResponseData,
  RemoveRoleResponseData,
  RolesListResponse,
  RolesListResponseData,
} from "./types";

// ===================================
// SERVICIO DE ADMINISTRACIÓN DE USUARIOS
// ===================================

export class AdminService {
  /**
   * Obtener lista de usuarios con paginación
   */
  static async getUsers(limit = 50, offset = 0): Promise<UsersListResponse> {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });

    return apiClient.get<UserWithRoles[]>(`/admin/users?${params}`);
  }

  /**
   * Obtener roles de un usuario específico
   */
  static async getUserRoles(userId: number): Promise<UserRolesResponse> {
    return apiClient.get<UserRolesData>(`/admin/users/${userId}/roles`);
  }

  /**
   * Asignar rol a un usuario
   */
  static async assignRoleToUser(
    userId: number,
    roleId: number
  ): Promise<AssignRoleResponse> {
    return apiClient.post<AssignRoleResponseData>(
      `/admin/users/${userId}/roles`,
      { roleId }
    );
  }

  /**
   * Remover rol de un usuario
   */
  static async removeRoleFromUser(
    userId: number,
    roleId: number
  ): Promise<RemoveRoleResponse> {
    return apiClient.delete<RemoveRoleResponseData>(
      `/admin/users/${userId}/roles`,
      { body: JSON.stringify({ roleId }) }
    );
  }

  /**
   * Obtener permisos de un usuario
   */
  static async getUserPermissions(userId: number) {
    return apiClient.get(`/admin/users/${userId}/permissions`);
  }

  /**
   * Obtener sesiones de trabajo de un usuario
   */
  static async getUserWorkSessions(
    userId: number,
    page = 1,
    limit = 20,
    startDate?: string,
    endDate?: string,
    status?: string
  ) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (startDate) params.append("startDate", startDate);
    if (endDate) params.append("endDate", endDate);
    if (status) params.append("status", status);

    return apiClient.get(`/admin/users/${userId}/work-sessions?${params}`);
  }
}

// ===================================
// SERVICIO DE ADMINISTRACIÓN DE ROLES
// ===================================

export class RoleAdminService {
  /**
   * Obtener todos los roles disponibles
   */
  static async getRoles(): Promise<RolesListResponse> {
    return apiClient.get<RolesListResponseData>("/admin/roles");
  }

  /**
   * Obtener permisos de un rol específico
   */
  static async getRolePermissions(roleId: number) {
    return apiClient.get(`/admin/roles/${roleId}/permissions`);
  }

  /**
   * Asignar permisos a un rol
   */
  static async assignPermissionsToRole(roleId: number, permissions: string[]) {
    return apiClient.post(`/admin/roles/${roleId}/permissions`, {
      permissions,
    });
  }

  /**
   * Remover permisos de un rol
   */
  static async removePermissionsFromRole(
    roleId: number,
    permissions: string[]
  ) {
    return apiClient.delete(`/admin/roles/${roleId}/permissions`, {
      body: JSON.stringify({ permissions }),
    });
  }
}

// ===================================
// SERVICIO DE ADMINISTRACIÓN DE PERMISOS
// ===================================

export class PermissionAdminService {
  /**
   * Obtener todos los permisos disponibles
   */
  static async getPermissions() {
    return apiClient.get("/admin/permissions");
  }

  /**
   * Crear un nuevo permiso
   */
  static async createPermission(permissionData: {
    name: string;
    description?: string;
  }) {
    return apiClient.post("/admin/permissions", permissionData);
  }

  /**
   * Eliminar un permiso
   */
  static async deletePermission(permissionName: string) {
    return apiClient.delete(`/admin/permissions/${permissionName}`);
  }

  /**
   * Obtener roles que tienen un permiso específico
   */
  static async getRolesWithPermission(permissionName: string) {
    return apiClient.get(`/admin/permissions/${permissionName}/roles`);
  }
}

// ===================================
// SERVICIO DE ADMINISTRACIÓN DE SESIONES
// ===================================

export class WorkSessionAdminService {
  /**
   * Obtener todas las sesiones con filtros
   */
  static async getWorkSessions(
    page = 1,
    limit = 20,
    filters?: {
      userId?: number;
      status?: string;
      startDate?: string;
      endDate?: string;
      isValidSession?: boolean;
    }
  ) {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    if (filters?.userId) params.append("userId", filters.userId.toString());
    if (filters?.status) params.append("status", filters.status);
    if (filters?.startDate) params.append("startDate", filters.startDate);
    if (filters?.endDate) params.append("endDate", filters.endDate);
    if (filters?.isValidSession !== undefined)
      params.append("isValidSession", filters.isValidSession.toString());

    return apiClient.get(`/admin/work-sessions?${params}`);
  }

  /**
   * Obtener una sesión específica
   */
  static async getWorkSession(sessionId: number) {
    return apiClient.get(`/admin/work-sessions/${sessionId}`);
  }

  /**
   * Crear una nueva sesión
   */
  static async createWorkSession(sessionData: any) {
    return apiClient.post("/admin/work-sessions", sessionData);
  }

  /**
   * Actualizar una sesión
   */
  static async updateWorkSession(sessionId: number, sessionData: any) {
    return apiClient.put(`/admin/work-sessions/${sessionId}`, sessionData);
  }

  /**
   * Eliminar una sesión
   */
  static async deleteWorkSession(sessionId: number) {
    return apiClient.delete(`/admin/work-sessions/${sessionId}`);
  }

  /**
   * Revalidar una sesión específica
   */
  static async revalidateWorkSession(sessionId: number) {
    return apiClient.post(`/admin/work-sessions/${sessionId}/revalidate`);
  }

  /**
   * Obtener estadísticas de sesiones
   */
  static async getWorkSessionStatistics() {
    return apiClient.get("/admin/work-sessions/statistics");
  }
}
