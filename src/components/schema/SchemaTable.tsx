"use client";

import { useState } from "react";
import { ChevronRight, Table2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { ColumnBadge } from "./ColumnBadge";
import type { SchemaTable as SchemaTableType } from "@/lib/types";

interface SchemaTableProps {
  table: SchemaTableType;
  onSelect: (sql: string) => void;
}

export function SchemaTable({ table, onSelect }: SchemaTableProps) {
  const [expanded, setExpanded] = useState(false);

  const handleSelect = () => {
    onSelect(`SELECT * FROM ${table.schema === "public" ? "" : `${table.schema}.`}${table.name} LIMIT 50;`);
  };

  return (
    <div className="select-none">
      <div
        className="flex items-center gap-1 px-2 py-1 rounded cursor-pointer hover:bg-muted/60 group"
        onClick={() => setExpanded((v) => !v)}
      >
        <ChevronRight
          className={cn(
            "h-3 w-3 text-muted-foreground shrink-0 transition-transform duration-150",
            expanded && "rotate-90"
          )}
        />
        <Table2 className="h-3 w-3 text-muted-foreground shrink-0" />
        <span
          className="text-xs font-mono text-foreground/90 flex-1 truncate hover:text-primary transition-colors"
          onClick={(e) => {
            e.stopPropagation();
            handleSelect();
          }}
          title={`Click to SELECT * FROM ${table.name}`}
        >
          {table.name}
        </span>
        <span className="text-[10px] text-muted-foreground/60 shrink-0 tabular-nums">
          {table.columnCount}
        </span>
      </div>

      {expanded && (
        <div className="border-l border-border/40 ml-4 mb-0.5">
          {table.columns.map((col) => (
            <ColumnBadge key={col.name} column={col} />
          ))}
        </div>
      )}
    </div>
  );
}
