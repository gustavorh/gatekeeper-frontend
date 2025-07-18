"use client";

import { ReactNode } from "react";
import { useRoles } from "../hooks/useRoles";
import { useAuth } from "../contexts/AuthContext";

interface RoleProtectedRouteProps {
  children: ReactNode;
  roles?: string[];
  permissions?: string[];
  fallback?: ReactNode;
  requireAll?: boolean; // Si es true, requiere TODOS los roles/permisos. Si es false, requiere AL MENOS UNO
}

export default function RoleProtectedRoute({
  children,
  roles = [],
  permissions = [],
  fallback = null,
  requireAll = false,
}: RoleProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuth();
  const { hasRole, hasAnyRole, hasPermission, hasAnyPermission } = useRoles();

  // Si está cargando, mostrar loading
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Si no está autenticado, no mostrar nada (el ProtectedRoute general se encarga)
  if (!isAuthenticated) {
    return fallback;
  }

  // Verificar roles si se especificaron
  if (roles.length > 0) {
    const hasRequiredRoles = requireAll
      ? roles.every((role) => hasRole(role))
      : hasAnyRole(roles);

    if (!hasRequiredRoles) {
      return fallback || <AccessDenied requiredRoles={roles} />;
    }
  }

  // Verificar permisos si se especificaron
  if (permissions.length > 0) {
    const hasRequiredPermissions = requireAll
      ? permissions.every((permission) => hasPermission(permission))
      : hasAnyPermission(permissions);

    if (!hasRequiredPermissions) {
      return fallback || <AccessDenied requiredPermissions={permissions} />;
    }
  }

  return <>{children}</>;
}

// Componente por defecto para acceso denegado
function AccessDenied({
  requiredRoles = [],
  requiredPermissions = [],
}: {
  requiredRoles?: string[];
  requiredPermissions?: string[];
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg
            className="w-8 h-8 text-red-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
        </div>

        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Acceso Denegado
        </h2>

        <p className="text-gray-600 mb-6">
          No tienes permisos suficientes para acceder a esta sección.
        </p>

        {requiredRoles.length > 0 && (
          <div className="text-sm text-gray-500 mb-2">
            <strong>Roles requeridos:</strong> {requiredRoles.join(", ")}
          </div>
        )}

        {requiredPermissions.length > 0 && (
          <div className="text-sm text-gray-500 mb-4">
            <strong>Permisos requeridos:</strong>{" "}
            {requiredPermissions.join(", ")}
          </div>
        )}

        <button
          onClick={() => window.history.back()}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          Regresar
        </button>
      </div>
    </div>
  );
}
