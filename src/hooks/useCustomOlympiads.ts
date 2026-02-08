import { useState, useEffect, useCallback } from "react";
import { Olympiad } from "@/data/olympiads";

const STORAGE_KEY = "custom-olympiads";

function generateId(): string {
  return `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function getStoredOlympiads(): Olympiad[] {
  if (typeof window === "undefined") return [];
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (e) {
      console.error("Failed to parse custom olympiads:", e);
    }
  }
  return [];
}

export function useCustomOlympiads() {
  // Initialize synchronously from localStorage
  const [customOlympiads, setCustomOlympiads] = useState<Olympiad[]>(getStoredOlympiads);

  // Save to localStorage whenever customOlympiads changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customOlympiads));
  }, [customOlympiads]);

  const addOlympiad = useCallback((olympiad: Omit<Olympiad, "id">) => {
    const newOlympiad: Olympiad = {
      ...olympiad,
      id: generateId(),
    };
    setCustomOlympiads((prev) => [...prev, newOlympiad]);
    return newOlympiad.id;
  }, []);

  const updateOlympiad = useCallback((id: string, updates: Partial<Omit<Olympiad, "id">>) => {
    setCustomOlympiads((prev) =>
      prev.map((o) => (o.id === id ? { ...o, ...updates } : o))
    );
  }, []);

  const deleteOlympiad = useCallback((id: string) => {
    setCustomOlympiads((prev) => prev.filter((o) => o.id !== id));
  }, []);

  const isCustomOlympiad = useCallback((id: string) => {
    return id.startsWith("custom-");
  }, []);

  return {
    customOlympiads,
    addOlympiad,
    updateOlympiad,
    deleteOlympiad,
    isCustomOlympiad,
  };
}
