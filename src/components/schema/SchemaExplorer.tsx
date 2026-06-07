"use client";

import { RefreshCw, Database, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SchemaTable } from "./SchemaTable";
import { SeedButton } from "./SeedButton";
import { useSchema } from "@/hooks/useSchema";
import type { SchemaTable as SchemaTableType } from "@/lib/types";

interface SchemaExplorerProps {
  onTableSelect: (sql: string) => void;
}

export function SchemaExplorer({ onTableSelect }: SchemaExplorerProps) {
  const { state, refresh } = useSchema();

  const tablesBySchema: Record<string, SchemaTableType[]> = {};

  if (state.status === "success") {
    for (const table of state.tables) {
      if (!tablesBySchema[table.schema]) {
        tablesBySchema[table.schema] = [];
      }
      tablesBySchema[table.schema].push(table);
    }
  }

  return (
    <div className="flex flex-col h-full border-r border-border bg-sidebar">
      {/* Header */}
      <div className="flex items-center gap-1.5 px-3 py-2.5 border-b border-border shrink-0">
        <Database className="h-4 w-4 text-primary shrink-0" />
        <span className="text-sm font-semibold font-mono text-foreground truncate flex-1">
          {state.status === "success" ? state.database : "postgres"}
        </span>
        <SeedButton onSeeded={refresh} />
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 shrink-0"
          onClick={refresh}
          disabled={state.status === "loading"}
          title="Refresh schema"
        >
          <RefreshCw
            className={`h-3 w-3 ${state.status === "loading" ? "animate-spin" : ""}`}
          />
        </Button>
      </div>

      {/* Body */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {state.status === "loading" && (
            <div className="flex items-center gap-2 px-2 py-4 text-muted-foreground text-xs">
              <Loader2 className="h-3 w-3 animate-spin" />
              Loading schema…
            </div>
          )}

          {state.status === "error" && (
            <div className="flex flex-col gap-1 px-2 py-3">
              <div className="flex items-center gap-1.5 text-destructive text-xs">
                <AlertCircle className="h-3 w-3" />
                Connection error
              </div>
              <p className="text-[11px] text-muted-foreground">{state.error}</p>
            </div>
          )}

          {state.status === "success" && state.tables.length === 0 && (
            <p className="px-2 py-4 text-xs text-muted-foreground">
              No user tables found.
            </p>
          )}

          {state.status === "success" &&
            Object.entries(tablesBySchema).map(([schema, tables]) => (
              <div key={schema} className="mb-3">
                {Object.keys(tablesBySchema).length > 1 && (
                  <div className="px-2 py-0.5 text-[10px] uppercase tracking-wider text-muted-foreground/60 font-semibold">
                    {schema}
                  </div>
                )}
                {tables.map((table) => (
                  <SchemaTable
                    key={`${table.schema}.${table.name}`}
                    table={table}
                    onSelect={onTableSelect}
                  />
                ))}
              </div>
            ))}
        </div>
      </ScrollArea>
    </div>
  );
}
