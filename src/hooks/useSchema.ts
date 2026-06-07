"use client";

import { useState, useCallback, useEffect } from "react";
import type { SchemaTable } from "@/lib/types";

type SchemaState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; tables: SchemaTable[]; database: string }
  | { status: "error"; error: string };

export function useSchema() {
  const [state, setState] = useState<SchemaState>({ status: "idle" });

  const refresh = useCallback(async () => {
    setState({ status: "loading" });
    try {
      const res = await fetch("/api/schema");
      const data = (await res.json()) as
        | { tables: SchemaTable[]; database: string }
        | { error: string };

      if ("error" in data) {
        setState({ status: "error", error: data.error });
      } else {
        setState({
          status: "success",
          tables: data.tables,
          database: data.database,
        });
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Network error";
      setState({ status: "error", error: message });
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { state, refresh };
}
