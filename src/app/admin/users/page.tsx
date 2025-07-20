"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { useNotification } from "../../contexts/NotificationContext";
import { useRoles } from "../../hooks/useRoles";
import ProtectedRoute from "../../components/ProtectedRoute";
import RoleProtectedRoute from "../../components/RoleProtectedRoute";
import Header from "../../components/Header";
import Sidebar from "../../components/Sidebar";
import Footer from "../../components/Footer";
import { AdminService, RoleAdminService } from "../../lib/adminService";
import { useApiData, useMutation } from "../../lib/hooks";
import {
  UserWithRoles,
  UserRoleDetail,
  UsersListData,
  UserRolesData,
  AssignRoleRequest,
  RemoveRoleRequest,
  SystemRole,
} from "../../lib/types";
import { handleApiError } from "../../lib/index";

// ===================================
// COMPONENTES DE LA INTERFAZ
// ===================================

interface UserTableProps {
  users: UserWithRoles[];
  onViewRoles: (userId: number) => void;
  onViewPermissions: (userId: number) => void;
  onViewSessions: (userId: number) => void;
}

function UserTable({
  users,
  onViewRoles,
  onViewPermissions,
  onViewSessions,
}: UserTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-white border border-gray-200 rounded-lg shadow-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Usuario
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              RUT
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Email
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Roles
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Fecha de Creación
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Acciones
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10">
                    <div className="h-10 w-10 rounded-full bg-pink-100 flex items-center justify-center">
                      <span className="text-sm font-medium text-pink-600">
                        {user.nombre
                          ? user.nombre.charAt(0).toUpperCase()
                          : user.rut.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">
                      {user.nombre
                        ? `${user.nombre} ${user.apellido_paterno || ""} ${
                            user.apellido_materno || ""
                          }`.trim()
                        : "Sin nombre"}
                    </div>
                    <div className="text-sm text-gray-500">ID: {user.id}</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {user.rut}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {user.email || "Sin email"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex flex-wrap gap-1">
                  {user.roles && user.roles.length > 0 ? (
                    user.roles.map((role) => (
                      <span
                        key={role.roleId}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pink-100 text-pink-800"
                      >
                        {role.roleName}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-gray-500">Sin roles</span>
                  )}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {user.createdAt
                  ? new Date(user.createdAt).toLocaleDateString("es-CL")
                  : "N/A"}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex space-x-2">
                  <button
                    onClick={() => onViewRoles(user.id)}
                    className="text-pink-600 hover:text-pink-900 text-xs font-medium"
                  >
                    Roles
                  </button>
                  <button
                    onClick={() => onViewPermissions(user.id)}
                    className="text-blue-600 hover:text-blue-900 text-xs font-medium"
                  >
                    Permisos
                  </button>
                  <button
                    onClick={() => onViewSessions(user.id)}
                    className="text-green-600 hover:text-green-900 text-xs font-medium"
                  >
                    Sesiones
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface UserRolesModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: number | null;
  userRoles: UserRoleDetail[];
  availableRoles: SystemRole[];
  onAssignRole: (roleId: number) => Promise<void>;
  onRemoveRole: (roleId: number) => Promise<void>;
}

function UserRolesModal({
  isOpen,
  onClose,
  userId,
  userRoles,
  availableRoles,
  onAssignRole,
  onRemoveRole,
}: UserRolesModalProps) {
  const [selectedRoleId, setSelectedRoleId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAssignRole = async () => {
    if (!selectedRoleId) return;

    setIsLoading(true);
    try {
      await onAssignRole(selectedRoleId);
      setSelectedRoleId(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveRole = async (roleId: number) => {
    setIsLoading(true);
    try {
      await onRemoveRole(roleId);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header del Modal */}
        <div className="bg-gradient-to-r from-pink-500 to-rose-500 px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">
                  Gestión de Roles
                </h3>
                <p className="text-pink-100 text-sm">Usuario ID: {userId}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center transition-all duration-200"
            >
              <svg
                className="w-5 h-5 text-white"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Contenido del Modal */}
        <div className="p-8 space-y-8">
          {/* Roles Asignados */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <h4 className="text-lg font-semibold text-gray-900">
                Roles Asignados
              </h4>
              <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {userRoles.length}
              </span>
            </div>

            {userRoles.length > 0 ? (
              <div className="space-y-3">
                {userRoles.map((role) => (
                  <div
                    key={role.roleId}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl hover:shadow-md transition-all duration-200"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <svg
                          className="w-4 h-4 text-white"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">
                          {role.roleName}
                        </span>
                        {role.roleDescription && (
                          <p className="text-sm text-gray-500 mt-1">
                            {role.roleDescription}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveRole(role.roleId)}
                      disabled={isLoading}
                      className="flex items-center space-x-2 px-3 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      <span className="text-sm font-medium">Remover</span>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
                <svg
                  className="w-12 h-12 text-gray-400 mx-auto mb-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                  />
                </svg>
                <p className="text-gray-500 text-sm">No hay roles asignados</p>
                <p className="text-gray-400 text-xs mt-1">
                  Asigna roles para dar permisos al usuario
                </p>
              </div>
            )}
          </div>

          {/* Separador */}
          <div className="border-t border-gray-200"></div>

          {/* Asignar Nuevo Rol */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <h4 className="text-lg font-semibold text-gray-900">
                Asignar Nuevo Rol
              </h4>
            </div>

            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
              <div className="flex space-x-4">
                <div className="flex-1">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Seleccionar Rol
                  </label>
                  <select
                    value={selectedRoleId || ""}
                    onChange={(e) =>
                      setSelectedRoleId(Number(e.target.value) || null)
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                  >
                    <option value="">Seleccionar un rol...</option>
                    {availableRoles
                      .filter(
                        (role) =>
                          !userRoles.some(
                            (userRole) => userRole.roleId === role.id
                          )
                      )
                      .map((role) => (
                        <option key={role.id} value={role.id}>
                          {role.name} - {role.description}
                        </option>
                      ))}
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    onClick={handleAssignRole}
                    disabled={!selectedRoleId || isLoading}
                    className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-medium rounded-lg hover:from-blue-600 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    {isLoading ? (
                      <svg
                        className="animate-spin w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                    ) : (
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                    )}
                    <span>Asignar</span>
                  </button>
                </div>
              </div>

              {selectedRoleId && (
                <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                  <div className="flex items-start space-x-2">
                    <svg
                      className="w-5 h-5 text-blue-600 mt-0.5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div className="text-sm text-blue-800">
                      <p className="font-medium">
                        {
                          availableRoles.find((r) => r.id === selectedRoleId)
                            ?.name
                        }
                      </p>
                      <p className="text-blue-700 mt-1">
                        {
                          availableRoles.find((r) => r.id === selectedRoleId)
                            ?.description
                        }
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Información Adicional */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <svg
                className="w-5 h-5 text-gray-500 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="text-sm text-gray-600">
                <p className="font-medium text-gray-900 mb-1">
                  Información sobre Roles
                </p>
                <p>
                  Los roles determinan los permisos y accesos que tendrá el
                  usuario en el sistema. Puedes asignar múltiples roles a un
                  mismo usuario.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer del Modal */}
        <div className="bg-gray-50 px-8 py-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Total de roles disponibles: {availableRoles.length}
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===================================
// PÁGINA PRINCIPAL
// ===================================

export default function AdminUsersPage() {
  const { user } = useAuth();
  const { isAdmin } = useRoles();
  const { showSuccess, showError, showInfo } = useNotification();

  // Estados
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [isRolesModalOpen, setIsRolesModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(20);

  // Hooks para datos
  const {
    data: usersResponse,
    loading: usersLoading,
    error: usersError,
    execute: refreshUsers,
  } = useApiData(
    () => AdminService.getUsers(limit, (currentPage - 1) * limit),
    [currentPage, limit]
  );

  // Extraer los usuarios del response
  const usersData = usersResponse || [];

  const {
    data: userRolesData,
    loading: rolesLoading,
    error: rolesError,
    execute: loadUserRoles,
  } = useApiData(
    () =>
      selectedUserId
        ? AdminService.getUserRoles(selectedUserId)
        : Promise.resolve({ success: true, data: { userId: 0, roles: [] } }),
    [selectedUserId]
  );

  const {
    data: availableRolesData,
    loading: availableRolesLoading,
    execute: loadAvailableRoles,
  } = useApiData(() => RoleAdminService.getRoles(), []);

  // Mutaciones
  const assignRoleMutation = useMutation((roleId: number) =>
    selectedUserId
      ? AdminService.assignRoleToUser(selectedUserId, roleId)
      : Promise.resolve({ success: true, data: { success: true, message: "" } })
  );

  const removeRoleMutation = useMutation((roleId: number) =>
    selectedUserId
      ? AdminService.removeRoleFromUser(selectedUserId, roleId)
      : Promise.resolve({ success: true, data: { success: true, message: "" } })
  );

  // Efectos
  useEffect(() => {
    if (isRolesModalOpen && selectedUserId) {
      loadUserRoles();
      loadAvailableRoles();
    }
  }, [isRolesModalOpen, selectedUserId]);

  // Manejadores
  const handleViewRoles = (userId: number) => {
    setSelectedUserId(userId);
    setIsRolesModalOpen(true);
  };

  const handleViewPermissions = (userId: number) => {
    // TODO: Implementar vista de permisos
    showInfo("Vista de permisos en desarrollo");
  };

  const handleViewSessions = (userId: number) => {
    // TODO: Implementar vista de sesiones
    showInfo("Vista de sesiones en desarrollo");
  };

  const handleAssignRole = async (roleId: number) => {
    try {
      await assignRoleMutation.mutate(roleId);
      showSuccess("Rol asignado exitosamente");
      loadUserRoles(); // Recargar roles del usuario
      refreshUsers(); // Recargar lista de usuarios
    } catch (error) {
      showError(handleApiError(error, "Error al asignar rol"));
    }
  };

  const handleRemoveRole = async (roleId: number) => {
    try {
      await removeRoleMutation.mutate(roleId);
      showSuccess("Rol removido exitosamente");
      loadUserRoles(); // Recargar roles del usuario
      refreshUsers(); // Recargar lista de usuarios
    } catch (error) {
      showError(handleApiError(error, "Error al remover rol"));
    }
  };

  const handleCloseRolesModal = () => {
    setIsRolesModalOpen(false);
    setSelectedUserId(null);
  };

  // Manejo de errores
  if (usersError) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex">
          <Sidebar />
          <div className="flex-1 p-8">
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Error al cargar usuarios
                  </h3>
                  <div className="mt-2 text-sm text-red-700">{usersError}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <RoleProtectedRoute roles={["admin"]}>
        <div className="min-h-screen bg-gray-50">
          <Header />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex">
              <Sidebar />
              <div className="flex-1 ml-8">
                {/* Header de la página */}
                <div className="mb-8">
                  <div className="flex items-center justify-between">
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900">
                        Gestión de Usuarios
                      </h1>
                      <p className="mt-2 text-sm text-gray-600">
                        Administra usuarios, roles y permisos del sistema
                      </p>
                    </div>
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={refreshUsers}
                        disabled={usersLoading}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 disabled:opacity-50"
                      >
                        <svg
                          className="w-4 h-4 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                          />
                        </svg>
                        Actualizar
                      </button>
                    </div>
                  </div>
                </div>

                {/* Estadísticas */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <svg
                            className="h-6 w-6 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                            />
                          </svg>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">
                              Total Usuarios
                            </dt>
                            <dd className="text-lg font-medium text-gray-900">
                              {usersData?.length || 0}
                            </dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <svg
                            className="h-6 w-6 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">
                              Activos
                            </dt>
                            <dd className="text-lg font-medium text-gray-900">
                              {usersData?.filter(
                                (u: UserWithRoles) =>
                                  u.roles && u.roles.length > 0
                              ).length || 0}
                            </dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <svg
                            className="h-6 w-6 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                            />
                          </svg>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">
                              Sin Roles
                            </dt>
                            <dd className="text-lg font-medium text-gray-900">
                              {usersData?.filter(
                                (u: UserWithRoles) =>
                                  !u.roles || u.roles.length === 0
                              ).length || 0}
                            </dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <svg
                            className="h-6 w-6 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 10V3L4 14h7v7l9-11h-7z"
                            />
                          </svg>
                        </div>
                        <div className="ml-5 w-0 flex-1">
                          <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">
                              Administradores
                            </dt>
                            <dd className="text-lg font-medium text-gray-900">
                              {usersData?.filter((u: UserWithRoles) =>
                                u.roles?.some(
                                  (r: UserRoleDetail) => r.roleName === "admin"
                                )
                              ).length || 0}
                            </dd>
                          </dl>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tabla de usuarios */}
                <div className="bg-white shadow rounded-lg">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Lista de Usuarios
                    </h3>
                  </div>
                  <div className="p-6">
                    {usersLoading ? (
                      <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600"></div>
                      </div>
                    ) : usersData && usersData.length > 0 ? (
                      <>
                        <UserTable
                          users={usersData}
                          onViewRoles={handleViewRoles}
                          onViewPermissions={handleViewPermissions}
                          onViewSessions={handleViewSessions}
                        />

                        {/* Paginación */}
                        <div className="mt-6 flex items-center justify-between">
                          <div className="text-sm text-gray-700">
                            Mostrando {(currentPage - 1) * limit + 1} a{" "}
                            {Math.min(currentPage * limit, usersData.length)} de{" "}
                            {usersData.length} usuarios
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => setCurrentPage(currentPage - 1)}
                              disabled={currentPage === 1}
                              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Anterior
                            </button>
                            <button
                              onClick={() => setCurrentPage(currentPage + 1)}
                              disabled={currentPage * limit >= usersData.length}
                              className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              Siguiente
                            </button>
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-12">
                        <svg
                          className="mx-auto h-12 w-12 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                          />
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">
                          No hay usuarios
                        </h3>
                        <p className="mt-1 text-sm text-gray-500">
                          No se encontraron usuarios en el sistema.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Modal de roles */}
          <UserRolesModal
            isOpen={isRolesModalOpen}
            onClose={handleCloseRolesModal}
            userId={selectedUserId}
            userRoles={userRolesData?.roles || []}
            availableRoles={availableRolesData?.roles || []}
            onAssignRole={handleAssignRole}
            onRemoveRole={handleRemoveRole}
          />
          <Footer />
        </div>
      </RoleProtectedRoute>
    </ProtectedRoute>
  );
}
