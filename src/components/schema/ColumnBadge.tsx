"use client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { Column } from "@/lib/types";

interface ColumnBadgeProps {
  column: Column;
}

export function ColumnBadge({ column }: ColumnBadgeProps) {
  return (
    <div className="flex items-center gap-1.5 py-0.5 pl-6 pr-2 text-xs group">
      <span className="text-muted-foreground font-mono truncate flex-1 min-w-0">
        {column.name}
      </span>
      <div className="flex items-center gap-1 shrink-0">
        {column.isPrimaryKey && (
          <Badge
            variant="outline"
            className="text-[10px] px-1 py-0 h-4 border-yellow-600/50 text-yellow-500 font-mono"
          >
            PK
          </Badge>
        )}
        <Badge
          variant="outline"
          className={cn(
            "text-[10px] px-1 py-0 h-4 font-mono border-border/50",
            "text-muted-foreground"
          )}
        >
          {column.type}
        </Badge>
        {!column.nullable && (
          <span className="text-[10px] text-red-500/70" title="NOT NULL">
            !
          </span>
        )}
      </div>
    </div>
  );
}
