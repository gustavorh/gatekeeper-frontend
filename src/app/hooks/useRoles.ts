import { useAuth } from "../contexts/AuthContext";
import { useMemo } from "react";

export function useRoles() {
  const { user } = useAuth();

  const hasRole = useMemo(() => {
    return (role: string): boolean => {
      if (!user?.roles) return false;
      return user.roles.includes(role);
    };
  }, [user?.roles]);

  const hasAnyRole = useMemo(() => {
    return (roles: string[]): boolean => {
      if (!user?.roles) return false;
      return roles.some((role) => user.roles!.includes(role));
    };
  }, [user?.roles]);

  const hasPermission = useMemo(() => {
    return (permission: string): boolean => {
      if (!user?.permissions) return false;
      return user.permissions.includes(permission);
    };
  }, [user?.permissions]);

  const hasAnyPermission = useMemo(() => {
    return (permissions: string[]): boolean => {
      if (!user?.permissions) return false;
      return permissions.some((permission) =>
        user.permissions!.includes(permission)
      );
    };
  }, [user?.permissions]);

  const isAdmin = useMemo(() => {
    return hasRole("admin");
  }, [hasRole]);

  const isEmployee = useMemo(() => {
    return hasRole("employee");
  }, [hasRole]);

  const canReadOwnTimeTracking = useMemo(() => {
    return hasPermission("time_tracking.read_own");
  }, [hasPermission]);

  const canWriteOwnTimeTracking = useMemo(() => {
    return hasPermission("time_tracking.write_own");
  }, [hasPermission]);

  const canReadAllTimeTracking = useMemo(() => {
    return hasPermission("time_tracking.read_all");
  }, [hasPermission]);

  const canManageUsers = useMemo(() => {
    return hasPermission("user_management.write");
  }, [hasPermission]);

  const canManageRoles = useMemo(() => {
    return hasPermission("roles.write");
  }, [hasPermission]);

  const canReadStatistics = useMemo(() => {
    return hasAnyPermission(["statistics.read_own", "statistics.read_all"]);
  }, [hasAnyPermission]);

  const canReadAllStatistics = useMemo(() => {
    return hasPermission("statistics.read_all");
  }, [hasPermission]);

  return {
    // Funciones básicas
    hasRole,
    hasAnyRole,
    hasPermission,
    hasAnyPermission,

    // Roles específicos
    isAdmin,
    isEmployee,

    // Permisos específicos
    canReadOwnTimeTracking,
    canWriteOwnTimeTracking,
    canReadAllTimeTracking,
    canManageUsers,
    canManageRoles,
    canReadStatistics,
    canReadAllStatistics,

    // Datos del usuario
    userRoles: user?.roles || [],
    userPermissions: user?.permissions || [],
  };
}
