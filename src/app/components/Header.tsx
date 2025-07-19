"use client";

import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useSystemHealth } from "../hooks/useSystemHealth";

export default function Header() {
  const { user, logout } = useAuth();
  const {
    isHealthy,
    status: systemStatus,
    lastCheck,
    isChecking,
    error: healthError,
  } = useSystemHealth(30000);

  const [showHealthTooltip, setShowHealthTooltip] = useState(false);

  // Obtener el nombre del usuario
  const userName = user?.nombre
    ? `${user.nombre} ${user.apellido_paterno || ""}`.trim()
    : user?.rut || "Usuario";

  return (
    <header className="bg-white shadow-lg border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-18">
          <div className="flex items-center">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mr-2 shadow-md"
                  style={{ backgroundColor: "#fe938c" }}
                >
                  <svg
                    className="w-6 h-6 text-white"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1M12 7C13.4 7 14.8 8.6 14.8 10V11H16V17H8V11H9.2V10C9.2 8.6 10.6 7 12 7M12 8.2C11.2 8.2 10.4 8.7 10.4 10V11H13.6V10C13.6 8.7 12.8 8.2 12 8.2Z" />
                  </svg>
                </div>
                <div
                  className="absolute -top-1 -right-1 w-3 h-3 rounded-full animate-pulse"
                  style={{ backgroundColor: "#22c55e" }}
                ></div>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                    GateKeeper
                  </span>
                  <span
                    className="px-2 py-1 text-xs font-medium text-white rounded-full"
                    style={{ backgroundColor: "#fe938c" }}
                  >
                    BETA
                  </span>
                </div>
                <span className="text-xs text-gray-500 font-medium tracking-wide">
                  Control de Acceso
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-9 h-9 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full flex items-center justify-center shadow-inner">
                  <svg
                    className="w-5 h-5 text-gray-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div
                  className="absolute -top-1 -right-1 w-3 h-3 rounded-full border-2 border-white"
                  style={{ backgroundColor: "#22c55e" }}
                ></div>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-800">
                  {userName}
                </span>
                <span className="text-xs text-gray-500">Sesión Activa</span>
              </div>
            </div>
            <div className="h-8 w-px bg-gray-200"></div>
            <div
              className="relative flex items-center space-x-2 cursor-help"
              onMouseEnter={() => setShowHealthTooltip(true)}
              onMouseLeave={() => setShowHealthTooltip(false)}
            >
              <div
                className={`w-3 h-3 rounded-full ${
                  isHealthy
                    ? "bg-green-500 animate-pulse"
                    : "bg-red-500 animate-pulse"
                }`}
              ></div>
              <span className="text-sm font-medium text-gray-600">
                {isHealthy ? "Sistema Activo" : "Sistema Inactivo"}
              </span>
              {isChecking && (
                <svg
                  className="w-3 h-3 text-gray-400 animate-spin"
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
              )}

              {/* Tooltip personalizado */}
              {showHealthTooltip && (
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 z-50">
                  <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 shadow-lg max-w-xs">
                    <div className="space-y-1">
                      {systemStatus ? (
                        <>
                          <div className="flex justify-between">
                            <span className="font-medium">Estado:</span>
                            <span
                              className={`capitalize ${
                                systemStatus.status === "healthy"
                                  ? "text-green-400"
                                  : "text-red-400"
                              }`}
                            >
                              {systemStatus.status === "healthy"
                                ? "Saludable"
                                : "Con problemas"}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">Servicio:</span>
                            <span className="text-blue-400">
                              {systemStatus.service}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">Versión:</span>
                            <span className="text-gray-300">
                              {systemStatus.version}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="font-medium">
                              Última verificación:
                            </span>
                            <span className="text-gray-300">
                              {systemStatus.timestamp
                                ? new Date(
                                    systemStatus.timestamp
                                  ).toLocaleTimeString()
                                : "N/A"}
                            </span>
                          </div>
                        </>
                      ) : healthError ? (
                        <div className="text-red-400">
                          <div className="font-medium">Error:</div>
                          <div className="text-xs mt-1">{healthError}</div>
                        </div>
                      ) : (
                        <div className="text-yellow-400">
                          Verificando estado del sistema...
                        </div>
                      )}
                    </div>
                    {/* Flecha del tooltip */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2">
                      <div className="w-2 h-2 bg-gray-900 rotate-45 transform origin-bottom-left"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className="h-8 w-px bg-gray-200"></div>
            <button
              onClick={logout}
              className="group relative inline-flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-300 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <svg
                className="w-4 h-4 text-gray-500 group-hover:text-gray-700 transition-colors duration-200"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span className="group-hover:text-gray-900 transition-colors duration-200">
                Cerrar Sesión
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
