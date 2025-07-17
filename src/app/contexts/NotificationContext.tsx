"use client";

import { createContext, useContext, ReactNode } from "react";
import toast from "react-hot-toast";

interface NotificationContextType {
  showSuccess: (message: string) => void;
  showError: (message: string) => void;
  showInfo: (message: string) => void;
  showWarning: (message: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const showSuccess = (message: string) => {
    toast.success(message, {
      iconTheme: {
        primary: "#10b981",
        secondary: "#fff",
      },
    });
  };

  const showError = (message: string) => {
    toast.error(message, {
      iconTheme: {
        primary: "#ef4444",
        secondary: "#fff",
      },
    });
  };

  const showInfo = (message: string) => {
    toast(message, {
      icon: "ℹ️",
      style: {
        background: "#3b82f6",
        color: "#fff",
      },
    });
  };

  const showWarning = (message: string) => {
    toast(message, {
      icon: "⚠️",
      style: {
        background: "#f59e0b",
        color: "#fff",
      },
    });
  };

  return (
    <NotificationContext.Provider
      value={{ showSuccess, showError, showInfo, showWarning }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error(
      "useNotification must be used within a NotificationProvider"
    );
  }
  return context;
}
