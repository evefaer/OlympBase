import { useState, useEffect, useCallback } from "react";

export type NotificationMode = "all" | "selected";

const STORAGE_KEY = "olimpbase-notification-mode";

export function useNotificationMode() {
  const [mode, setModeState] = useState<NotificationMode>(() => {
    if (typeof window !== "undefined") {
      return (localStorage.getItem(STORAGE_KEY) as NotificationMode) || "all";
    }
    return "all";
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, mode);
  }, [mode]);

  const toggleMode = useCallback(() => {
    setModeState((prev) => (prev === "all" ? "selected" : "all"));
  }, []);

  return { mode, toggleMode };
}
