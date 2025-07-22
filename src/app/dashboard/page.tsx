"use client";

import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";

export default function DashboardPage() {
  const { user } = useAuth();

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
                        <h2 className="text-2xl font-bold text-gray-900">
                          ¡Bienvenido de vuelta, {user?.firstName}!
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                          Panel de Control de Acceso
                        </p>
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <svg
                              className="h-8 w-8 text-blue-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"
                              />
                            </svg>
                          </div>
                          <div className="ml-4">
                            <h3 className="text-sm font-medium text-blue-900">
                              Usuarios Activos
                            </h3>
                            <p className="text-2xl font-semibold text-blue-600">
                              0
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-green-50 rounded-xl p-4 border border-green-100">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <svg
                              className="h-8 w-8 text-green-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          </div>
                          <div className="ml-4">
                            <h3 className="text-sm font-medium text-green-900">
                              Puntos de Acceso
                            </h3>
                            <p className="text-2xl font-semibold text-green-600">
                              0
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-100">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <svg
                              className="h-8 w-8 text-yellow-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                          </div>
                          <div className="ml-4">
                            <h3 className="text-sm font-medium text-yellow-900">
                              Eventos Hoy
                            </h3>
                            <p className="text-2xl font-semibold text-yellow-600">
                              0
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="mt-8">
                      <h3 className="text-lg font-medium text-gray-900 mb-4">
                        Acciones Rápidas
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <button className="bg-white border border-gray-300 rounded-lg p-4 text-left hover:bg-gray-50 transition-colors">
                          <div className="flex items-center">
                            <svg
                              className="h-6 w-6 text-blue-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                              />
                            </svg>
                            <span className="ml-3 text-sm font-medium text-gray-900">
                              Agregar Usuario
                            </span>
                          </div>
                        </button>

                        <button className="bg-white border border-gray-300 rounded-lg p-4 text-left hover:bg-gray-50 transition-colors">
                          <div className="flex items-center">
                            <svg
                              className="h-6 w-6 text-green-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                            <span className="ml-3 text-sm font-medium text-gray-900">
                              Ver Reportes
                            </span>
                          </div>
                        </button>

                        <button className="bg-white border border-gray-300 rounded-lg p-4 text-left hover:bg-gray-50 transition-colors">
                          <div className="flex items-center">
                            <svg
                              className="h-6 w-6 text-purple-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                            </svg>
                            <span className="ml-3 text-sm font-medium text-gray-900">
                              Configuración
                            </span>
                          </div>
                        </button>

                        <button className="bg-white border border-gray-300 rounded-lg p-4 text-left hover:bg-gray-50 transition-colors">
                          <div className="flex items-center">
                            <svg
                              className="h-6 w-6 text-orange-600"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                              />
                            </svg>
                            <span className="ml-3 text-sm font-medium text-gray-900">
                              Analíticas
                            </span>
                          </div>
                        </button>
                      </div>
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
