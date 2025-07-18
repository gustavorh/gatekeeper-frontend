"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useNotification } from "../contexts/NotificationContext";
import ProtectedRoute from "../components/ProtectedRoute";
import {
  timeTrackingAPI,
  statisticsAPI,
  formatUtils,
  type CurrentStatus,
  type TodaySession,
  type DashboardStats,
  type TimeEntry,
  type ButtonStates,
} from "../lib/api";

interface Activity {
  id: string;
  type: "clock_in" | "clock_out" | "start_lunch" | "resume_shift";
  timestamp: string;
}

export default function Dashboard() {
  const { user, logout } = useAuth();
  const { showSuccess, showInfo, showError } = useNotification();

  // Estados del dashboard
  const [currentStatus, setCurrentStatus] = useState<
    "clocked_out" | "clocked_in" | "on_lunch"
  >("clocked_out");
  const [buttonStates, setButtonStates] = useState<ButtonStates>({
    clockIn: { enabled: false },
    clockOut: { enabled: false },
    startLunch: { enabled: false },
    resumeShift: { enabled: false },
  });
  const [todaySession, setTodaySession] = useState<TodaySession | null>(null);
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(
    null
  );
  const [activities, setActivities] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);

  // Obtener el nombre del usuario
  const userName = user?.nombre
    ? `${user.nombre} ${user.apellido_paterno || ""}`.trim()
    : user?.rut || "Usuario";

  // Cargar datos del dashboard
  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Cargar datos en paralelo
      const [statusData, todayData, statsData, activitiesData] =
        await Promise.all([
          timeTrackingAPI.getCurrentStatus(),
          timeTrackingAPI.getTodaySession(),
          statisticsAPI.getDashboardStats(),
          timeTrackingAPI.getRecentActivities(5),
        ]);

      setCurrentStatus(statusData.status);
      setButtonStates(statusData.buttonStates);
      setTodaySession(todayData);
      setDashboardStats(statsData);
      setActivities(activitiesData.activities);
    } catch (error) {
      console.error("Error cargando datos del dashboard:", error);
      showError("Error al cargar los datos del dashboard");
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    loadDashboardData();
  }, []);

  // Manejar acciones del reloj
  const handleClockIn = async () => {
    try {
      const result = await timeTrackingAPI.clockIn();
      setCurrentStatus("clocked_in");
      setButtonStates(result.buttonStates || buttonStates);
      showSuccess(result.message);

      // Recargar datos
      await loadDashboardData();
    } catch (error) {
      console.error("Error en clock-in:", error);
      showError(
        error instanceof Error ? error.message : "Error al registrar entrada"
      );
    }
  };

  const handleClockOut = async () => {
    try {
      const result = await timeTrackingAPI.clockOut();
      setCurrentStatus("clocked_out");
      setButtonStates(result.buttonStates || buttonStates);
      showSuccess(result.message);

      // Recargar datos
      await loadDashboardData();
    } catch (error) {
      console.error("Error en clock-out:", error);
      showError(
        error instanceof Error ? error.message : "Error al registrar salida"
      );
    }
  };

  const handleStartLunch = async () => {
    try {
      const result = await timeTrackingAPI.startLunch();
      setCurrentStatus("on_lunch");
      setButtonStates(result.buttonStates || buttonStates);
      showInfo(result.message);

      // Recargar datos
      await loadDashboardData();
    } catch (error) {
      console.error("Error en start-lunch:", error);
      showError(
        error instanceof Error ? error.message : "Error al iniciar almuerzo"
      );
    }
  };

  const handleResumeShift = async () => {
    try {
      const result = await timeTrackingAPI.resumeShift();
      setCurrentStatus("clocked_in");
      setButtonStates(result.buttonStates || buttonStates);
      showSuccess(result.message);

      // Recargar datos
      await loadDashboardData();
    } catch (error) {
      console.error("Error en resume-shift:", error);
      showError(
        error instanceof Error ? error.message : "Error al reanudar turno"
      );
    }
  };

  // Usar funciones del formatUtils para obtener texto e íconos
  const getActivityText = (type: string) => formatUtils.getActivityText(type);
  const getActivityIcon = (type: string) => formatUtils.getActivityIcon(type);

  // Mostrar loading mientras se cargan los datos
  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-400 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando dashboard...</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
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
                        PRO
                      </span>
                    </div>
                    <span className="text-xs text-gray-500 font-medium tracking-wide">
                      Plataforma de Control de Acceso
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

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex">
            {/* Sidebar */}
            <div className="w-64 bg-white rounded-xl shadow-lg border border-gray-100 h-fit">
              <div className="p-6">
                <div className="mb-6">
                  <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                    Navegación
                  </h2>
                </div>
                <nav>
                  <ul className="space-y-1">
                    <li>
                      <a
                        href="#"
                        className="flex items-center space-x-3 text-white rounded-xl px-4 py-3 font-medium shadow-lg transition-all duration-200 hover:shadow-xl"
                        style={{ backgroundColor: "#fe938c" }}
                      >
                        <div className="w-5 h-5 flex items-center justify-center">
                          <svg
                            className="w-5 h-5"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
                          </svg>
                        </div>
                        <span>Panel Principal</span>
                        <div className="ml-auto w-2 h-2 bg-white bg-opacity-40 rounded-full"></div>
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="flex items-center space-x-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-xl px-4 py-3 font-medium transition-all duration-200 group hover:shadow-sm"
                      >
                        <div className="w-5 h-5 flex items-center justify-center">
                          <svg
                            className="w-5 h-5 group-hover:text-pink-400 transition-colors duration-200"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <span className="group-hover:text-pink-400 transition-colors duration-200">
                          Mis Turnos
                        </span>
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="flex items-center space-x-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-xl px-4 py-3 font-medium transition-all duration-200 group hover:shadow-sm"
                      >
                        <div className="w-5 h-5 flex items-center justify-center">
                          <svg
                            className="w-5 h-5 group-hover:text-pink-400 transition-colors duration-200"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                          </svg>
                        </div>
                        <span className="group-hover:text-pink-400 transition-colors duration-200">
                          Mis Estadísticas
                        </span>
                      </a>
                    </li>
                    <li>
                      <a
                        href="#"
                        className="flex items-center space-x-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-xl px-4 py-3 font-medium transition-all duration-200 group hover:shadow-sm"
                      >
                        <div className="w-5 h-5 flex items-center justify-center">
                          <svg
                            className="w-5 h-5 group-hover:text-pink-400 transition-colors duration-200"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                        <span className="group-hover:text-pink-400 transition-colors duration-200">
                          Configuración
                        </span>
                      </a>
                    </li>
                  </ul>
                </nav>
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 ml-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Clock Actions */}
                <div className="lg:col-span-2">
                  <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-xl font-bold text-gray-900">
                          Gestión de Horarios
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                          Administra tu jornada laboral y descansos
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium text-gray-600">
                          Sistema Activo
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <button
                        onClick={handleClockIn}
                        disabled={!buttonStates.clockIn.enabled}
                        title={buttonStates.clockIn.reason}
                        className={`group relative p-6 rounded-2xl border-2 transition-all duration-300 ${
                          buttonStates.clockIn.enabled
                            ? "border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 text-blue-700 shadow-lg hover:shadow-xl hover:scale-[1.02]"
                            : "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
                        }`}
                      >
                        <div className="text-center">
                          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-white bg-opacity-70 flex items-center justify-center">
                            <svg
                              className="w-6 h-6"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                          <div className="font-semibold text-sm">Entrada</div>
                          <div className="text-xs opacity-70 mt-1">
                            Comienza tu jornada
                          </div>
                        </div>
                      </button>

                      <button
                        onClick={handleClockOut}
                        disabled={!buttonStates.clockOut.enabled}
                        title={buttonStates.clockOut.reason}
                        className={`group relative p-6 rounded-2xl border-2 transition-all duration-300 ${
                          buttonStates.clockOut.enabled
                            ? "border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 text-gray-700 shadow-lg hover:shadow-xl hover:scale-[1.02]"
                            : "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
                        }`}
                      >
                        <div className="text-center">
                          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-white bg-opacity-70 flex items-center justify-center">
                            <svg
                              className="w-6 h-6"
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z"
                                clipRule="evenodd"
                              />
                            </svg>
                          </div>
                          <div className="font-semibold text-sm">Salida</div>
                          <div className="text-xs opacity-70 mt-1">
                            Termina tu jornada
                          </div>
                        </div>
                      </button>

                      <button
                        onClick={handleStartLunch}
                        disabled={!buttonStates.startLunch.enabled}
                        title={buttonStates.startLunch.reason}
                        className={`group relative p-6 rounded-2xl border-2 transition-all duration-300 ${
                          buttonStates.startLunch.enabled
                            ? "border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 text-orange-700 shadow-lg hover:shadow-xl hover:scale-[1.02]"
                            : "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
                        }`}
                      >
                        <div className="text-center">
                          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-white bg-opacity-70 flex items-center justify-center">
                            <svg
                              className="w-6 h-6"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                              />
                            </svg>
                          </div>
                          <div className="font-semibold text-sm">
                            Iniciar Almuerzo
                          </div>
                          <div className="text-xs opacity-70 mt-1">
                            Tómate un descanso
                          </div>
                        </div>
                      </button>

                      <button
                        onClick={handleResumeShift}
                        disabled={!buttonStates.resumeShift.enabled}
                        title={buttonStates.resumeShift.reason}
                        className={`group relative p-6 rounded-2xl border-2 transition-all duration-300 ${
                          buttonStates.resumeShift.enabled
                            ? "border-green-200 bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 text-green-700 shadow-lg hover:shadow-xl hover:scale-[1.02]"
                            : "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
                        }`}
                      >
                        <div className="text-center">
                          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-white bg-opacity-70 flex items-center justify-center">
                            <svg
                              className="w-6 h-6"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8m-7 4h6m3-11V5a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2v-1"
                              />
                            </svg>
                          </div>
                          <div className="font-semibold text-sm">
                            Reanudar Turno
                          </div>
                          <div className="text-xs opacity-70 mt-1">
                            Vuelve al trabajo
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Today's Shift */}
                  <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mt-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-xl font-bold text-gray-900">
                        Turno de Hoy
                      </h2>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm text-gray-500">
                          Estado en Vivo
                        </span>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div
                              className={`w-4 h-4 rounded-full mr-3 shadow-sm ${
                                currentStatus === "clocked_in"
                                  ? "bg-green-500 animate-pulse"
                                  : currentStatus === "on_lunch"
                                  ? "bg-yellow-500 animate-pulse"
                                  : "bg-gray-400"
                              }`}
                            ></div>
                            <div>
                              <span className="text-gray-900 font-medium">
                                {currentStatus === "clocked_in"
                                  ? "Entrada registrada a las"
                                  : currentStatus === "on_lunch"
                                  ? "En almuerzo desde las"
                                  : "Sin entrada registrada"}
                              </span>
                              <div className="text-xs text-gray-500 mt-1">
                                {currentStatus === "clocked_in"
                                  ? "Sesión de trabajo activa"
                                  : currentStatus === "on_lunch"
                                  ? "Descanso en progreso"
                                  : "Listo para comenzar"}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-2xl font-bold text-green-600">
                              {todaySession?.session?.clockInTime
                                ? formatUtils.formatTime(
                                    todaySession.session.clockInTime
                                  )
                                : "--:--"}
                            </span>
                            <div className="text-xs text-gray-500 mt-1">
                              {todaySession?.session?.clockInTime
                                ? "Hoy"
                                : "N/A"}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-gray-900 font-medium">
                              Total de horas hoy
                            </span>
                            <div className="text-xs text-gray-500 mt-1">
                              {todaySession?.session?.clockInTime &&
                              currentStatus !== "clocked_out"
                                ? "Sesión en curso"
                                : "Sin sesión activa"}
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-2xl font-bold text-blue-600">
                              {todaySession?.workedHours?.toFixed(1) || "0.0"}
                            </span>
                            <div className="text-xs text-gray-500 mt-1">
                              {todaySession?.session?.clockInTime &&
                              currentStatus !== "clocked_out"
                                ? "hrs (en curso)"
                                : "hrs"}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Statistics */}
                <div className="space-y-6">
                  <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-lg font-bold text-gray-900">
                        Estadísticas
                      </h2>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span className="text-sm text-gray-500">Resumen</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-sm font-medium text-gray-900">
                              Horas esta semana
                            </span>
                            <div className="text-xs text-gray-500 mt-1">
                              Tiempo total trabajado
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-2xl font-bold text-blue-600">
                              {dashboardStats?.weekStats?.totalHours?.toFixed(
                                1
                              ) || "0.0"}
                            </span>
                            <div className="text-xs text-gray-500">hrs</div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-sm font-medium text-gray-900">
                              Turnos este mes
                            </span>
                            <div className="text-xs text-gray-500 mt-1">
                              Días trabajados
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-2xl font-bold text-gray-900">
                              {dashboardStats?.monthStats?.totalDays || 0}
                            </span>
                            <div className="text-xs text-gray-500">días</div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-sm font-medium text-gray-900">
                              Promedio de entrada
                            </span>
                            <div className="text-xs text-gray-500 mt-1">
                              Hora típica de inicio
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-lg font-bold text-green-600">
                              {dashboardStats?.averageEntryTime || "--:--"}
                            </span>
                            <div className="text-xs text-gray-500">AM</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recent Activity */}
                  <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-lg font-bold text-gray-900">
                        Actividad Reciente
                      </h2>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <span className="text-sm text-gray-500">En Vivo</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      {activities.length > 0 ? (
                        activities.map((activity) => (
                          <div
                            key={activity.id}
                            className="bg-gray-50 rounded-xl p-4 border border-gray-100 hover:shadow-md transition-all duration-200"
                          >
                            <div className="flex items-center space-x-4">
                              <div
                                className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${
                                  activity.type === "clock_in"
                                    ? "bg-blue-100"
                                    : activity.type === "clock_out"
                                    ? "bg-gray-100"
                                    : activity.type === "start_lunch"
                                    ? "bg-orange-100"
                                    : "bg-green-100"
                                }`}
                              >
                                <span className="text-lg">
                                  {getActivityIcon(activity.type)}
                                </span>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <div className="text-sm font-semibold text-gray-900">
                                      {getActivityText(activity.type)}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                      {formatUtils.formatDate(
                                        activity.timestamp
                                      )}{" "}
                                      a las{" "}
                                      {formatUtils.formatTime(
                                        activity.timestamp
                                      )}
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <div className="text-xs text-gray-400">
                                      {activity.isValid ? "✅" : "❌"}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <svg
                              className="w-8 h-8 text-gray-400"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                              />
                            </svg>
                          </div>
                          <h3 className="text-sm font-medium text-gray-900 mb-1">
                            Sin actividad reciente
                          </h3>
                          <p className="text-xs text-gray-500">
                            Tus acciones aparecerán aquí
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg backdrop-blur-sm">
          <div className="max-w-6xl mx-auto flex justify-between items-center px-6 py-4 text-sm text-gray-500">
            <div className="flex space-x-6">
              <span>© {new Date().getFullYear()} GateKeeper</span>
              <button className="hover:text-gray-700 transition-colors duration-200">
                Política de Privacidad
              </button>
              <button className="hover:text-gray-700 transition-colors duration-200">
                Términos de Servicio
              </button>
            </div>
            <div className="flex space-x-6">
              <button className="hover:text-gray-700 transition-colors duration-200">
                Soporte
              </button>
              <span>Versión 0.1.1</span>
              <a
                href="https://github.com/gustavorh"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1 hover:text-gray-900 transition-all duration-200 group"
              >
                <span className="text-gray-600 group-hover:text-gray-800">
                  by
                </span>
                <span
                  className="group-hover:scale-110 transition-transform duration-200"
                  style={{ color: "#fe938c" }}
                >
                  ⚡
                </span>
                <span className="font-medium bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent group-hover:from-pink-400 group-hover:to-pink-600">
                  gustavorh
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
