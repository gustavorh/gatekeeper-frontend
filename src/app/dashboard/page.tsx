"use client";

import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import { apiClient } from "@/lib/api";
import { useState } from "react";

export default function DashboardPage() {
  const { user } = useAuth();
  const [clockInLoading, setClockInLoading] = useState(false);
  const [clockOutLoading, setClockOutLoading] = useState(false);
  const [clockInError, setClockInError] = useState<string | null>(null);
  const [clockOutError, setClockOutError] = useState<string | null>(null);

  const handleClockIn = async () => {
    setClockInLoading(true);
    setClockInError(null);

    try {
      await apiClient.post("/shifts/clock-in", {});
      // You could add a success notification here
    } catch (error) {
      setClockInError(
        error instanceof Error ? error.message : "Error al registrar entrada"
      );
    } finally {
      setClockInLoading(false);
    }
  };

  const handleClockOut = async () => {
    setClockOutLoading(true);
    setClockOutError(null);

    try {
      await apiClient.post("/shifts/clock-out", {});
      // You could add a success notification here
    } catch (error) {
      setClockOutError(
        error instanceof Error ? error.message : "Error al registrar salida"
      );
    } finally {
      setClockOutLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />

        <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex">
            <Sidebar />

            {/* Main Content */}
            <div className="flex-1 ml-8">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Welcome Section */}
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
                        onClick={handleClockIn}
                        disabled={clockInLoading}
                        className="group relative p-6 rounded-2xl border-2 transition-all duration-300 border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200 text-blue-700 shadow-lg hover:shadow-xl hover:scale-[1.02]"
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
                          <div className="font-semibold text-sm">
                            {clockInLoading ? "Registrando..." : "Entrada"}
                          </div>
                          <div className="text-xs opacity-70 mt-1">
                            Comienza tu jornada
                          </div>
                        </div>
                      </button>

                      <button
                        onClick={handleClockOut}
                        disabled={clockOutLoading}
                        className="group relative p-6 rounded-2xl border-2 transition-all duration-300 border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100 hover:from-gray-100 hover:to-gray-200 text-gray-700 shadow-lg hover:shadow-xl hover:scale-[1.02]"
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
                          <div className="font-semibold text-sm">
                            {clockOutLoading ? "Registrando..." : "Salida"}
                          </div>
                          <div className="text-xs opacity-70 mt-1">
                            Termina tu jornada
                          </div>
                        </div>
                      </button>

                      <button
                        disabled
                        className="group relative p-6 rounded-2xl border-2 transition-all duration-300 border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 text-orange-700 shadow-lg hover:shadow-xl hover:scale-[1.02]"
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
                        disabled
                        className="group relative p-6 rounded-2xl border-2 transition-all duration-300 border-green-200 bg-gradient-to-br from-green-50 to-green-100 hover:from-green-100 hover:to-green-200 text-green-700 shadow-lg hover:shadow-xl hover:scale-[1.02]"
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

                  {/* Recent Activity */}
                  <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6 mt-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-lg font-bold text-gray-900">
                        Actividad Reciente
                      </h2>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                        <span className="text-sm text-gray-500">En Vivo</span>
                      </div>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-500 text-center py-8">
                        No hay actividad reciente para mostrar
                      </p>
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
                              0.0
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
                              0
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
                              --:--
                            </span>
                            <div className="text-xs text-gray-500">AM</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* System Status */}
                  <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-lg font-bold text-gray-900">
                        Estado del Sistema
                      </h2>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-sm text-gray-500">Operativo</span>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-sm font-medium text-gray-900">
                              Base de Datos
                            </span>
                            <div className="text-xs text-gray-500 mt-1">
                              Conexión estable
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-bold text-green-600">
                              Online
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-sm font-medium text-gray-900">
                              API Backend
                            </span>
                            <div className="text-xs text-gray-500 mt-1">
                              Servicios activos
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-bold text-blue-600">
                              Online
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-100">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-sm font-medium text-gray-900">
                              Autenticación
                            </span>
                            <div className="text-xs text-gray-500 mt-1">
                              JWT válido
                            </div>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-bold text-yellow-600">
                              Activo
                            </span>
                          </div>
                        </div>
                      </div>
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
