// Core application types
export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  permissions: string[];
  clientId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  name: string;
  clientId?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Client/Organization types
export interface Client {
  id: string;
  name: string;
  domain: string;
  settings: ClientSettings;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ClientSettings {
  theme: {
    primaryColor: string;
    logo?: string;
  };
  features: {
    timeTracking: boolean;
    accessControl: boolean;
    reporting: boolean;
  };
}

// Error types
export interface ApiError {
  message: string;
  status: number;
  code?: string;
}

// Form validation types
export interface ValidationError {
  field: string;
  message: string;
}

export interface FormState<T> {
  data: T;
  errors: ValidationError[];
  isValid: boolean;
  isSubmitting: boolean;
} 