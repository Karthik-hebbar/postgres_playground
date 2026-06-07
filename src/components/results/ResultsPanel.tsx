"use client";

import { Loader2, TerminalSquare } from "lucide-react";
import { ResultsTable } from "./ResultsTable";
import { ResultsError } from "./ResultsError";
import { ResultsMeta } from "./ResultsMeta";
import type { QueryResult, QueryError } from "@/lib/types";

type ResultsState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; result: QueryResult }
  | { status: "error"; error: QueryError };

interface ResultsPanelProps {
  state: ResultsState;
}

export function ResultsPanel({ state }: ResultsPanelProps) {
  return (
    <div className="flex flex-col h-full bg-background">
      {/* Meta bar — only when we have a result */}
      {state.status === "success" && (
        <ResultsMeta
          rowCount={state.result.rowCount}
          duration={state.result.duration}
        />
      )}
      {state.status === "error" && state.error.duration !== undefined && (
        <div className="px-3 py-1.5 border-b border-border bg-card/30 text-xs text-muted-foreground font-mono shrink-0">
          Failed after {state.error.duration}ms
        </div>
      )}

      {/* Body */}
      <div className="flex-1 overflow-hidden">
        {state.status === "idle" && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-muted-foreground/40">
            <TerminalSquare className="h-10 w-10" />
            <span className="text-sm">Run a query to see results</span>
          </div>
        )}

        {state.status === "loading" && (
          <div className="flex items-center justify-center h-full gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span className="text-sm font-mono">Executing…</span>
          </div>
        )}

        {state.status === "error" && <ResultsError error={state.error} />}

        {state.status === "success" && <ResultsTable result={state.result} />}
      </div>
    </div>
  );
}
