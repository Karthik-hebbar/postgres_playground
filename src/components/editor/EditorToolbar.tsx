"use client";

import { Play, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { QueryHistory } from "./QueryHistory";
import type { HistoryEntry } from "@/lib/types";

interface EditorToolbarProps {
  onRun: () => void;
  isLoading: boolean;
  history: HistoryEntry[];
  onHistorySelect: (sql: string) => void;
  onHistoryClear: () => void;
}

export function EditorToolbar({
  onRun,
  isLoading,
  history,
  onHistorySelect,
  onHistoryClear,
}: EditorToolbarProps) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 border-b border-border bg-card/30 shrink-0">
      <Button
        onClick={onRun}
        disabled={isLoading}
        size="sm"
        className="h-7 gap-1.5 text-xs bg-primary text-primary-foreground hover:bg-primary/90 font-mono font-medium"
      >
        {isLoading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Play className="h-3.5 w-3.5 fill-current" />
        )}
        Run
        <span className="text-[10px] opacity-60 hidden sm:inline">
          ⌘↵
        </span>
      </Button>
      <div className="h-4 w-px bg-border" />
      <QueryHistory
        history={history}
        onSelect={onHistorySelect}
        onClear={onHistoryClear}
      />
    </div>
  );
}
