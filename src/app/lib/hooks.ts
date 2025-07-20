// ===================================
// HOOKS PERSONALIZADOS PARA API
// ===================================
// Hooks reutilizables para manejo de estados con el cliente API base

import { useState, useCallback } from "react";
import { ApiResponse, ApiState, ApiHookResult } from "./types";
import { ApiClient, ApiClientError, extractErrorMessages } from "./apiClient";

// ===================================
// HOOK BASE PARA API CALLS
// ===================================

/**
 * Hook base para llamadas API con manejo de estados
 */
export function useApiCall<T>(
  apiCall: () => Promise<ApiResponse<T>>
): ApiHookResult<T> {
  const [state, setState] = useState<ApiState<T>>({
    data: null,
    loading: false,
    error: null,
    fieldErrors: {},
  });

  const execute = useCallback(async () => {
    setState((prev) => ({
      ...prev,
      loading: true,
      error: null,
      fieldErrors: {},
    }));

    try {
      const response = await apiCall();

      if (response.success) {
        setState({
          data: response.data || null,
          loading: false,
          error: null,
          fieldErrors: {},
        });
      } else {
        // El backend envió success: false
        setState({
          data: null,
          loading: false,
          error: response.message || "Operation failed",
          fieldErrors: {},
        });
      }
    } catch (error) {
      const { message, fieldErrors } = extractErrorMessages(error);
      setState({
        data: null,
        loading: false,
        error: message,
        fieldErrors,
      });
    }
  }, [apiCall]);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      fieldErrors: {},
    });
  }, []);

  return {
    ...state,
    execute,
    reset,
  };
}

// ===================================
// HOOK PARA DATOS CON AUTO-FETCH
// ===================================

/**
 * Hook que ejecuta automáticamente la llamada API y permite refetch
 */
export function useApiData<T>(
  apiCall: () => Promise<ApiResponse<T>>,
  dependencies: any[] = []
): ApiHookResult<T> {
  const hook = useApiCall(apiCall);

  // Auto-execute on mount and when dependencies change
  React.useEffect(() => {
    hook.execute();
  }, dependencies);

  return hook;
}

// ===================================
// HOOK PARA MUTACIONES (POST, PUT, PATCH, DELETE)
// ===================================

/**
 * Hook específico para operaciones de mutación
 * No ejecuta automáticamente, debe llamarse manualmente
 */
export function useMutation<TData = any, TVariables = any>(
  mutationFn: (variables: TVariables) => Promise<ApiResponse<TData>>
): {
  data: TData | null;
  loading: boolean;
  error: string | null;
  fieldErrors: Record<string, string>;
  mutate: (variables: TVariables) => Promise<TData>;
  reset: () => void;
} {
  const [state, setState] = useState<ApiState<TData>>({
    data: null,
    loading: false,
    error: null,
    fieldErrors: {},
  });

  const mutate = useCallback(
    async (variables: TVariables): Promise<TData> => {
      setState((prev) => ({
        ...prev,
        loading: true,
        error: null,
        fieldErrors: {},
      }));

      try {
        const response = await mutationFn(variables);

        if (response.success && response.data) {
          setState({
            data: response.data,
            loading: false,
            error: null,
            fieldErrors: {},
          });
          return response.data;
        } else {
          const errorMessage = response.message || "Mutation failed";
          setState({
            data: null,
            loading: false,
            error: errorMessage,
            fieldErrors: {},
          });
          throw new Error(errorMessage);
        }
      } catch (error) {
        const { message, fieldErrors } = extractErrorMessages(error);
        setState({
          data: null,
          loading: false,
          error: message,
          fieldErrors,
        });
        throw error;
      }
    },
    [mutationFn]
  );

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      fieldErrors: {},
    });
  }, []);

  return {
    ...state,
    mutate,
    reset,
  };
}

// ===================================
// HOOK PARA PAGINACIÓN
// ===================================

export interface PaginatedState<T> extends ApiState<T[]> {
  currentPage: number;
  totalPages: number;
  total: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedHookResult<T> extends PaginatedState<T> {
  goToPage: (page: number) => Promise<void>;
  nextPage: () => Promise<void>;
  previousPage: () => Promise<void>;
  refresh: () => Promise<void>;
  reset: () => void;
}

/**
 * Hook para manejo de datos paginados
 */
export function usePaginatedData<T>(
  apiCall: (page: number, limit: number) => Promise<ApiResponse<T[]>>,
  limit: number = 10
): PaginatedHookResult<T> {
  const [state, setState] = useState<PaginatedState<T>>({
    data: null,
    loading: false,
    error: null,
    fieldErrors: {},
    currentPage: 1,
    totalPages: 0,
    total: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });

  const fetchPage = useCallback(
    async (page: number) => {
      setState((prev) => ({
        ...prev,
        loading: true,
        error: null,
        fieldErrors: {},
      }));

      try {
        const response = await apiCall(page, limit);

        if (response.success) {
          const pagination = response.meta?.pagination;

          setState({
            data: response.data || [],
            loading: false,
            error: null,
            fieldErrors: {},
            currentPage: pagination?.currentPage || page,
            totalPages: pagination?.totalPages || 0,
            total: pagination?.total || 0,
            hasNextPage: pagination?.hasNextPage || false,
            hasPreviousPage: pagination?.hasPreviousPage || false,
          });
        } else {
          setState((prev) => ({
            ...prev,
            loading: false,
            error: response.message || "Failed to load data",
            data: [],
          }));
        }
      } catch (error) {
        const { message, fieldErrors } = extractErrorMessages(error);
        setState((prev) => ({
          ...prev,
          loading: false,
          error: message,
          fieldErrors,
        }));
      }
    },
    [apiCall, limit]
  );

  const goToPage = useCallback(
    async (page: number) => {
      await fetchPage(page);
    },
    [fetchPage]
  );

  const nextPage = useCallback(async () => {
    if (state.hasNextPage) {
      await fetchPage(state.currentPage + 1);
    }
  }, [fetchPage, state.hasNextPage, state.currentPage]);

  const previousPage = useCallback(async () => {
    if (state.hasPreviousPage) {
      await fetchPage(state.currentPage - 1);
    }
  }, [fetchPage, state.hasPreviousPage, state.currentPage]);

  const refresh = useCallback(async () => {
    await fetchPage(state.currentPage);
  }, [fetchPage, state.currentPage]);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      fieldErrors: {},
      currentPage: 1,
      totalPages: 0,
      total: 0,
      hasNextPage: false,
      hasPreviousPage: false,
    });
  }, []);

  // Auto-fetch on mount
  React.useEffect(() => {
    fetchPage(1);
  }, []);

  return {
    ...state,
    goToPage,
    nextPage,
    previousPage,
    refresh,
    reset,
  };
}

// ===================================
// HOOK PARA POLLING (DATOS EN TIEMPO REAL)
// ===================================

export interface PollingOptions {
  interval: number; // ms
  enabled?: boolean;
  onError?: (error: any) => void;
}

/**
 * Hook para polling automático de datos
 */
export function usePolling<T>(
  apiCall: () => Promise<ApiResponse<T>>,
  options: PollingOptions
): ApiHookResult<T> & { startPolling: () => void; stopPolling: () => void } {
  const hook = useApiCall(apiCall);
  const [intervalId, setIntervalId] = useState<NodeJS.Timeout | null>(null);

  const startPolling = useCallback(() => {
    if (intervalId) return; // Already polling

    const id = setInterval(async () => {
      try {
        await hook.execute();
      } catch (error) {
        if (options.onError) {
          options.onError(error);
        }
      }
    }, options.interval);

    setIntervalId(id);
  }, [hook.execute, options.interval, options.onError, intervalId]);

  const stopPolling = useCallback(() => {
    if (intervalId) {
      clearInterval(intervalId);
      setIntervalId(null);
    }
  }, [intervalId]);

  // Auto-start polling if enabled
  React.useEffect(() => {
    if (options.enabled) {
      hook.execute(); // Execute immediately
      startPolling();
    } else {
      stopPolling();
    }

    return () => stopPolling();
  }, [options.enabled]);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => stopPolling();
  }, []);

  return {
    ...hook,
    startPolling,
    stopPolling,
  };
}

// ===================================
// UTILIDADES ADICIONALES
// ===================================

/**
 * Hook para debounced API calls
 */
export function useDebouncedApiCall<T>(
  apiCall: () => Promise<ApiResponse<T>>,
  delay: number = 300
): ApiHookResult<T> {
  const hook = useApiCall(apiCall);
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null);

  const debouncedExecute = useCallback(async () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    return new Promise<void>((resolve) => {
      const id = setTimeout(async () => {
        await hook.execute();
        resolve();
      }, delay);

      setTimeoutId(id);
    });
  }, [hook.execute, delay, timeoutId]);

  React.useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [timeoutId]);

  return {
    ...hook,
    execute: debouncedExecute,
  };
}

// Re-export React for convenience
import React from "react";
