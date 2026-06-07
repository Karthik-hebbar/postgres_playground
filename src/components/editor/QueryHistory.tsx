"use client";

import { History, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { HistoryEntry } from "@/lib/types";

interface QueryHistoryProps {
  history: HistoryEntry[];
  onSelect: (sql: string) => void;
  onClear: () => void;
}

function formatTime(ts: number): string {
  return new Date(ts).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function QueryHistory({ history, onSelect, onClear }: QueryHistoryProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 gap-1.5 text-xs text-muted-foreground"
          disabled={history.length === 0}
        >
          <History className="h-3.5 w-3.5" />
          History
          {history.length > 0 && (
            <span className="text-[10px] bg-muted rounded px-1">
              {history.length}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="start"
        className="w-[420px] max-h-[360px] overflow-y-auto font-mono"
      >
        {history.map((entry) => (
          <DropdownMenuItem
            key={entry.timestamp}
            className="flex flex-col items-start gap-0.5 cursor-pointer py-2"
            onClick={() => onSelect(entry.sql)}
          >
            <span className="text-[10px] text-muted-foreground">
              {formatTime(entry.timestamp)}
            </span>
            <span className="text-xs text-foreground whitespace-pre-wrap line-clamp-2 leading-relaxed">
              {entry.sql}
            </span>
          </DropdownMenuItem>
        ))}
        {history.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-xs text-destructive cursor-pointer gap-1.5"
              onClick={onClear}
            >
              <Trash2 className="h-3 w-3" />
              Clear history
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
