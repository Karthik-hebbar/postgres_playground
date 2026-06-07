"use client";

import { Rows, Clock } from "lucide-react";

interface ResultsMetaProps {
  rowCount: number;
  duration: number;
}

export function ResultsMeta({ rowCount, duration }: ResultsMetaProps) {
  return (
    <div className="flex items-center gap-4 px-3 py-1.5 border-b border-border bg-card/30 text-xs text-muted-foreground font-mono shrink-0">
      <span className="flex items-center gap-1">
        <Rows className="h-3 w-3" />
        {rowCount.toLocaleString()} {rowCount === 1 ? "row" : "rows"}
      </span>
      <span className="flex items-center gap-1">
        <Clock className="h-3 w-3" />
        {duration}ms
      </span>
      <div
        className="ml-auto h-1.5 rounded-full bg-muted overflow-hidden"
        style={{ width: "80px" }}
        title={`${duration}ms`}
      >
        <div
          className="h-full bg-primary rounded-full transition-all duration-500"
          style={{ width: `${Math.min((duration / 2000) * 100, 100)}%` }}
        />
      </div>
    </div>
  );
}
