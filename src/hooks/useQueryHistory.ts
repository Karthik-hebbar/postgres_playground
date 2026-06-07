"use client";

import { useState, useCallback, useEffect } from "react";
import type { HistoryEntry } from "@/lib/types";

const STORAGE_KEY = "pg_playground_history";
const MAX_ENTRIES = 20;

function loadHistory(): HistoryEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as HistoryEntry[]) : [];
  } catch {
    return [];
  }
}

function saveHistory(entries: HistoryEntry[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch {
    // localStorage may be unavailable
  }
}

export function useQueryHistory() {
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  const push = useCallback((sql: string) => {
    setHistory((prev) => {
      const entry: HistoryEntry = { sql, timestamp: Date.now() };
      // Deduplicate: remove any existing identical query
      const deduped = prev.filter((e) => e.sql !== sql);
      const next = [entry, ...deduped].slice(0, MAX_ENTRIES);
      saveHistory(next);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setHistory([]);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  return { history, push, clear };
}
