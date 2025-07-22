"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavItem {
  name: string;
  href: string;
  icon: React.ReactNode;
  description: string;
}

const navigation: NavItem[] = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: (
      <svg
        className="w-5 h-5"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
        />
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z"
        />
      </svg>
    ),
    description: "Vista general del sistema",
  },
  {
    name: "Turnos",
    href: "/turnos",
    icon: (
      <svg
        className="w-5 h-5"
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
    ),
    description: "Gestión de horarios",
  },
  {
    name: "Usuarios",
    href: "/admin/users",
    icon: (
      <svg
        className="w-5 h-5"
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
    ),
    description: "Administración de usuarios",
  },
  {
    name: "Reportes",
    href: "/reports",
    icon: (
      <svg
        className="w-5 h-5"
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
    ),
    description: "Análisis y estadísticas",
  },
  {
    name: "Configuración",
    href: "/settings",
    icon: (
      <svg
        className="w-5 h-5"
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
    ),
    description: "Ajustes del sistema",
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 bg-white rounded-xl shadow-lg border border-gray-100 p-6">
      <div className="mb-8">
        <h2 className="text-lg font-bold text-gray-900 mb-2">Navegación</h2>
        <p className="text-sm text-gray-500">
          Accede a las diferentes secciones
        </p>
      </div>

      <nav className="space-y-2">
        {navigation.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group flex items-center p-3 rounded-xl transition-all duration-200 ${
                isActive
                  ? "bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 text-blue-700 shadow-sm"
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <div
                className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center mr-3 ${
                  isActive
                    ? "bg-blue-100 text-blue-600"
                    : "bg-gray-100 text-gray-500 group-hover:bg-gray-200 group-hover:text-gray-700"
                }`}
              >
                {item.icon}
              </div>
              <div className="flex-1 min-w-0">
                <p
                  className={`text-sm font-medium ${
                    isActive ? "text-blue-700" : "text-gray-900"
                  }`}
                >
                  {item.name}
                </p>
                <p
                  className={`text-xs ${
                    isActive ? "text-blue-600" : "text-gray-500"
                  }`}
                >
                  {item.description}
                </p>
              </div>
              {isActive && (
                <div className="flex-shrink-0">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Quick Stats */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <h3 className="text-sm font-medium text-gray-900 mb-3">
          Resumen Rápido
        </h3>
        <div className="space-y-3">
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
            <div className="flex items-center justify-between">
              <span className="text-xs text-blue-700">Usuarios Activos</span>
              <span className="text-sm font-bold text-blue-600">0</span>
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-3 border border-green-100">
            <div className="flex items-center justify-between">
              <span className="text-xs text-green-700">Turnos Hoy</span>
              <span className="text-sm font-bold text-green-600">0</span>
            </div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-100">
            <div className="flex items-center justify-between">
              <span className="text-xs text-yellow-700">Eventos</span>
              <span className="text-sm font-bold text-yellow-600">0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
