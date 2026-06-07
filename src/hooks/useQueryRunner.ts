"use client";

import { useState, useCallback } from "react";
import type { QueryResult, QueryError } from "@/lib/types";

type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; result: QueryResult }
  | { status: "error"; error: QueryError };

export function useQueryRunner() {
  const [state, setState] = useState<State>({ status: "idle" });

  const run = useCallback(async (sql: string) => {
    if (!sql.trim()) return;
    setState({ status: "loading" });

    try {
      const res = await fetch("/api/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sql }),
      });

      const data = (await res.json()) as QueryResult | QueryError;

      if ("error" in data) {
        setState({ status: "error", error: data });
      } else {
        setState({ status: "success", result: data });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Network error";
      setState({ status: "error", error: { error: message } });
    }
  }, []);

  const reset = useCallback(() => setState({ status: "idle" }), []);

  return { state, run, reset };
}
