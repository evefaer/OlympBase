import { useState, useEffect, useCallback } from "react";
import { Olympiad, Subject, Grade, Scale } from "@/data/olympiads";

const STORAGE_KEY = "custom-olympiads";

function generateId(): string {
  return `custom-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function useCustomOlympiads() {
  const [customOlympiads, setCustomOlympiads] = useState<Olympiad[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setCustomOlympiads(parsed);
      } catch (e) {
        console.error("Failed to parse custom olympiads:", e);
      }
    }
  }, []);

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
