const API_BASE_URL = "http://localhost:9000";

export interface LoginCredentials {
  rut: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: {
    id: string;
    rut: string;
    nombre?: string;
    apellido_paterno?: string;
    apellido_materno?: string;
    email?: string;
    createdAt?: string;
  };
}

export interface AuthResult {
  success: boolean;
  data?: AuthResponse;
  error?: string;
}

export const authService = {
  async login(credentials: LoginCredentials): Promise<AuthResult> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.error || errorData.message || "Login failed",
        };
      }

      const data = await response.json();
      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: "Network error. Please check your connection.",
      };
    }
  },

  async register(credentials: LoginCredentials): Promise<AuthResult> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          success: false,
          error: errorData.error || errorData.message || "Registration failed",
        };
      }

      const data = await response.json();
      return {
        success: true,
        data,
      };
    } catch (error) {
      return {
        success: false,
        error: "Network error. Please check your connection.",
      };
    }
  },

  logout() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
    }
  },

  getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("token") || sessionStorage.getItem("token");
  },

  setToken(token: string, remember: boolean = false) {
    if (typeof window === "undefined") return;

    if (remember) {
      localStorage.setItem("token", token);
    } else {
      sessionStorage.setItem("token", token);
    }
  },

  isAuthenticated(): boolean {
    const token = this.getToken();
    if (!token) return false;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.exp > Date.now() / 1000;
    } catch {
      return false;
    }
  },

  getUserFromToken(): any {
    const token = this.getToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload;
    } catch {
      return null;
    }
  },
};
