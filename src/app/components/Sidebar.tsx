"use client";

import React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { authService } from "../lib/authService";

interface SidebarItem {
  id: string;
  name: string;
  href: string;
  icon: React.ReactElement;
  current?: boolean;
}

interface SidebarSection {
  id: string;
  title: string;
  items: SidebarItem[];
}

export default function Sidebar() {
  const pathname = usePathname();
  const currentUser = authService.getCurrentUser();
  const isAdmin = currentUser?.roles?.includes("admin") || false;

  // Navegación base para todos los usuarios
  const baseNavigation: SidebarItem[] = [
    {
      id: "dashboard",
      name: "Panel Principal",
      href: "/dashboard",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
        </svg>
      ),
    },
    {
      id: "turnos",
      name: "Mis Turnos",
      href: "/turnos",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    {
      id: "estadisticas",
      name: "Mis Estadísticas",
      href: "/estadisticas",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
        </svg>
      ),
    },
    {
      id: "configuracion",
      name: "Configuración",
      href: "/configuracion",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
  ];

  // Navegación de administración (solo para admins)
  const adminNavigation: SidebarItem[] = [
    {
      id: "admin-dashboard",
      name: "Dashboard Admin",
      href: "/admin/dashboard",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
        </svg>
      ),
    },
    {
      id: "admin-users",
      name: "Gestión de Usuarios",
      href: "/admin/users",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      id: "admin-roles",
      name: "Gestión de Roles",
      href: "/admin/roles",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z"
            clipRule="evenodd"
          />
          <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
        </svg>
      ),
    },
    {
      id: "admin-reports",
      name: "Reportes",
      href: "/admin/reports",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
    {
      id: "admin-settings",
      name: "Configuración del Sistema",
      href: "/admin/settings",
      icon: (
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path
            fillRule="evenodd"
            d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
            clipRule="evenodd"
          />
        </svg>
      ),
    },
  ];

  // Construir las secciones de navegación
  const navigationSections: SidebarSection[] = [
    {
      id: "main",
      title: "Navegación",
      items: baseNavigation,
    },
  ];

  // Añadir sección de administración si el usuario es admin
  if (isAdmin) {
    navigationSections.push({
      id: "admin",
      title: "Administración",
      items: adminNavigation,
    });
  }

  return (
    <div className="w-64 bg-white rounded-xl shadow-lg border border-gray-100 h-fit">
      <div className="p-6">
        {navigationSections.map((section) => (
          <div key={section.id} className="mb-6">
            <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
              {section.title}
            </h2>
            <nav>
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <li key={item.id}>
                      <Link
                        href={item.href}
                        className={`flex items-center space-x-3 rounded-xl px-4 py-3 font-medium transition-all duration-200 ${
                          isActive
                            ? "text-white shadow-lg hover:shadow-xl"
                            : "text-gray-600 hover:text-gray-900 hover:bg-gray-50 hover:shadow-sm"
                        }`}
                        style={isActive ? { backgroundColor: "#fe938c" } : {}}
                      >
                        <div className="w-5 h-5 flex items-center justify-center">
                          <div
                            className={`w-5 h-5 ${
                              isActive ? "" : "group-hover:text-pink-400"
                            } transition-colors duration-200`}
                          >
                            {item.icon}
                          </div>
                        </div>
                        <span
                          className={`${
                            isActive ? "" : "group-hover:text-pink-400"
                          } transition-colors duration-200`}
                        >
                          {item.name}
                        </span>
                        {isActive && (
                          <div className="ml-auto w-2 h-2 bg-white bg-opacity-40 rounded-full"></div>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>
        ))}
      </div>
    </div>
  );
}
