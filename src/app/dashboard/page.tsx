"use client";

import { useAuth } from "../contexts/AuthContext";
import { useNotification } from "../contexts/NotificationContext";
import ProtectedRoute from "../components/ProtectedRoute";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import Footer from "../components/Footer";
import {
  useDashboardData,
  useTimeOperations,
  formatUtils,
} from "../lib/timeTrackingService";
import { useDashboardStats } from "../lib/statisticsService";
import { TimeEntry } from "../lib/types";
import { handleApiError } from "../lib/index";

interface Activity {
  id: string;
  type: "clock_in" | "clock_out" | "start_lunch" | "resume_shift";
  timestamp: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const { showSuccess, showInfo, showError } = useNotification();

  // Usar los nuevos hooks
  const dashboardData = useDashboardData(true); // Auto-refresh enabled
  const timeOperations = useTimeOperations();
  const dashboardStats = useDashboardStats(true);

  // Extraer datos de los hooks
  const {
    currentStatus,
    todaySession,
    recentActivities,
    loading: dashboardLoading,
    error: dashboardError,
    refreshAll,
  } = dashboardData;

  const {
    loading: operationsLoading,
    error: operationsError,
    clockIn: handleClockIn,
    clockOut: handleClockOut,
    startLunch: handleStartLunch,
    resumeShift: handleResumeShift,
  } = timeOperations;

  // Estado de loading combinado
  const loading = dashboardLoading || operationsLoading;

  // Manejo de errores unificado
  const error = dashboardError || operationsError;

  // Wrappers para manejar mensajes y refresh
  const wrappedClockIn = async () => {
    try {
      const result = await handleClockIn();
      showSuccess("Entrada registrada exitosamente");
      await refreshAll();
    } catch (error: any) {
      console.error("Error en clock-in:", error);
      // Usar el mensaje de error exacto del backend
      const errorMessage = handleApiError(error, "Error al registrar entrada");
      showError(errorMessage);
    }
  };

  const wrappedClockOut = async () => {
    try {
      const result = await handleClockOut();
      showSuccess("Salida registrada exitosamente");
      await refreshAll();
    } catch (error: any) {
      console.error("Error en clock-out:", error);
      // Usar el mensaje de error exacto del backend
      const errorMessage = handleApiError(error, "Error al registrar salida");
      showError(errorMessage);
    }
  };

  const wrappedStartLunch = async () => {
    try {
      const result = await handleStartLunch();
      showInfo("Almuerzo iniciado");
      await refreshAll();
    } catch (error: any) {
      console.error("Error en start-lunch:", error);
      // Usar el mensaje de error exacto del backend
      const errorMessage = handleApiError(error, "Error al iniciar almuerzo");
      showError(errorMessage);
    }
  };

  const wrappedResumeShift = async () => {
    try {
      const result = await handleResumeShift();
      showSuccess("Turno reanudado");
      await refreshAll();
    } catch (error: any) {
      console.error("Error en resume-shift:", error);
      // Usar el mensaje de error exacto del backend
      const errorMessage = handleApiError(error, "Error al reanudar turno");
      showError(errorMessage);
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
        <Header />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex">
            <Sidebar />

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
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <button
                        onClick={wrappedClockIn}
                        disabled={
                          !currentStatus?.buttonStates?.clockIn?.enabled
                        }
                        title={currentStatus?.buttonStates?.clockIn?.reason}
                        className={`group relative p-6 rounded-2xl border-2 transition-all duration-300 ${
                          currentStatus?.buttonStates?.clockIn?.enabled
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
                        onClick={wrappedClockOut}
                        disabled={
                          !currentStatus?.buttonStates?.clockOut?.enabled
                        }
                        title={currentStatus?.buttonStates?.clockOut?.reason}
                        className={`group relative p-6 rounded-2xl border-2 transition-all duration-300 ${
                          currentStatus?.buttonStates?.clockOut?.enabled
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
                        onClick={wrappedStartLunch}
                        disabled={
                          !currentStatus?.buttonStates?.startLunch?.enabled
                        }
                        title={currentStatus?.buttonStates?.startLunch?.reason}
                        className={`group relative p-6 rounded-2xl border-2 transition-all duration-300 ${
                          currentStatus?.buttonStates?.startLunch?.enabled
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
                        onClick={wrappedResumeShift}
                        disabled={
                          !currentStatus?.buttonStates?.resumeShift?.enabled
                        }
                        title={currentStatus?.buttonStates?.resumeShift?.reason}
                        className={`group relative p-6 rounded-2xl border-2 transition-all duration-300 ${
                          currentStatus?.buttonStates?.resumeShift?.enabled
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
                                currentStatus?.status === "clocked_in"
                                  ? "bg-green-500 animate-pulse"
                                  : currentStatus?.status === "on_lunch"
                                  ? "bg-yellow-500 animate-pulse"
                                  : "bg-gray-400"
                              }`}
                            ></div>
                            <div>
                              <span className="text-gray-900 font-medium">
                                {currentStatus?.status === "clocked_in"
                                  ? "Entrada registrada a las"
                                  : currentStatus?.status === "on_lunch"
                                  ? "En almuerzo desde las"
                                  : "Sin entrada registrada"}
                              </span>
                              <div className="text-xs text-gray-500 mt-1">
                                {currentStatus?.status === "clocked_in"
                                  ? "Sesión de trabajo activa"
                                  : currentStatus?.status === "on_lunch"
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
                              currentStatus?.status !== "clocked_out"
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
                              currentStatus?.status !== "clocked_out"
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
                              {dashboardStats.data?.weekStats?.totalHours?.toFixed(
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
                              {dashboardStats.data?.monthStats?.totalDays || 0}
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
                              {dashboardStats.data?.averageEntryTime || "--:--"}
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
                      {recentActivities.length > 0 ? (
                        recentActivities.map((activity: TimeEntry) => (
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

        <Footer />
      </div>
    </ProtectedRoute>
  );
}
