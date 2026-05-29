"use client";

import { useState, useEffect } from "react";

const ACTIVE_GROUP_KEY = "foodmates_active_group";

// Module-level subscribers so all hook instances share the same value
const listeners = new Set<(id: string | null) => void>();

function getStoredId(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACTIVE_GROUP_KEY);
}

export function useActiveGroup() {
  // Initialize synchronously from localStorage to avoid flash of null
  const [activeGroupId, setActiveGroupIdState] = useState<string | null>(
    getStoredId
  );

  // Subscribe to cross-instance updates
  useEffect(() => {
    const handler = (id: string | null) => setActiveGroupIdState(id);
    listeners.add(handler);
    // Sync in case localStorage was updated before this component mounted
    const stored = getStoredId();
    if (stored !== activeGroupId) setActiveGroupIdState(stored);
    return () => {
      listeners.delete(handler);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function setActiveGroupId(id: string | null) {
    if (id) {
      localStorage.setItem(ACTIVE_GROUP_KEY, id);
    } else {
      localStorage.removeItem(ACTIVE_GROUP_KEY);
    }
    // Notify all hook instances
    listeners.forEach((l) => l(id));
  }

  return { activeGroupId, setActiveGroupId };
}
