import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "olimpbase-selected-olympiads";

export function useSelectedOlympiads() {
  const [selectedIds, setSelectedIds] = useState<string[]>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedIds));
  }, [selectedIds]);

  const toggleSelected = useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }, []);

  const isSelected = useCallback(
    (id: string) => selectedIds.includes(id),
    [selectedIds]
  );

  const clearAll = useCallback(() => {
    setSelectedIds([]);
  }, []);

  return {
    selectedIds,
    toggleSelected,
    isSelected,
    clearAll,
    selectedCount: selectedIds.length,
  };
}
