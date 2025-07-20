"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../contexts/AuthContext";
import { useNotification } from "../contexts/NotificationContext";
import Footer from "../components/Footer";

export default function LoginPage() {
  const [rut, setRut] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const { isAuthenticated, isLoading: authLoading, login } = useAuth();
  const { showError, showSuccess } = useNotification();
  const router = useRouter();

  // RUT formatting functions
  const cleanRut = (rut: string): string => {
    return rut.replace(/[.-]/g, "");
  };

  const formatRut = (rut: string): string => {
    const cleanedRut = cleanRut(rut);

    if (cleanedRut.length < 2) return cleanedRut;

    const body = cleanedRut.slice(0, -1);
    const dv = cleanedRut.slice(-1);

    // Add dots every 3 digits from right to left
    const formattedBody = body.replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    return `${formattedBody}-${dv}`;
  };

  const handleRutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers and hyphens, remove dots
    const cleanValue = value.replace(/[^0-9-]/g, "");
    setRut(cleanValue);
  };

  const handleRutBlur = () => {
    if (rut.trim()) {
      const formattedRut = formatRut(rut);
      setRut(formattedRut);
    }
  };

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Manual validation
    if (!rut.trim()) {
      showError("Por favor ingresa tu RUT");
      return;
    }

    if (!password.trim()) {
      showError("Por favor ingresa tu contraseña");
      return;
    }

    setIsLoggingIn(true);

    try {
      // Send clean RUT to backend (without dots and hyphens)
      const cleanedRut = cleanRut(rut.trim());
      const success = await login(cleanedRut, password.trim(), rememberMe);

      if (success) {
        router.push("/dashboard");
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-6 h-6 text-white"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">GateKeeper</h1>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center">
              <svg
                className="w-6 h-6 text-white"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">GateKeeper</h1>
          <p className="text-gray-600 mt-2">Control de Acceso</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* RUT Input */}
          <div>
            <label
              htmlFor="rut"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              RUT
            </label>
            <input
              type="text"
              id="rut"
              value={rut}
              onChange={handleRutChange}
              onBlur={handleRutBlur}
              placeholder="12345678-9"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors text-gray-900 placeholder-gray-500"
              autoFocus
              disabled={isLoggingIn}
            />
          </div>

          {/* Password Input */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa tu contraseña"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-colors pr-12 text-gray-900 placeholder-gray-500"
                disabled={isLoggingIn}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                disabled={isLoggingIn}
              >
                {showPassword ? (
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
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L5.636 5.636m4.242 4.242L15.12 15.12m-4.242-4.242L5.636 5.636m0 0L3 3m2.636 2.636L21 21"
                    />
                  </svg>
                ) : (
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
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Remember Me and Forgot Password */}
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                disabled={isLoggingIn}
              />
              <label htmlFor="remember" className="ml-2 text-sm text-gray-700">
                Recordarme
              </label>
            </div>
            <button
              type="button"
              className="text-sm text-blue-600 hover:text-blue-800"
              disabled={isLoggingIn}
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={isLoggingIn}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoggingIn ? "Iniciando sesión..." : "Iniciar Sesión"}
          </button>

          {/* Contact Support */}
          <div className="text-center text-sm text-gray-600">
            ¿No tienes una cuenta?{" "}
            <button
              type="button"
              className="text-blue-600 hover:text-blue-800"
              disabled={isLoggingIn}
            >
              Contactar Soporte
            </button>
          </div>
        </form>
      </div>

      <Footer />
    </div>
  );
}
