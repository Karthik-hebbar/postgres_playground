"use client";

import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { QueryError } from "@/lib/types";

interface ResultsErrorProps {
  error: QueryError;
}

export function ResultsError({ error }: ResultsErrorProps) {
  return (
    <div className="p-4">
      <Alert variant="destructive" className="font-mono border-destructive/50 bg-destructive/10">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle className="text-sm font-semibold">
          Query Error
          {error.code && (
            <span className="ml-2 text-[11px] font-normal opacity-70">
              [{error.code}]
            </span>
          )}
        </AlertTitle>
        <AlertDescription className="mt-2 space-y-1.5">
          <p className="text-sm leading-relaxed text-destructive-foreground/90">
            {error.error}
          </p>
          {error.hint && (
            <p className="text-xs text-destructive-foreground/60 border-t border-destructive/20 pt-1.5">
              <span className="font-semibold">Hint:</span> {error.hint}
            </p>
          )}
          {error.duration !== undefined && (
            <p className="text-[11px] text-destructive-foreground/40">
              Failed after {error.duration}ms
            </p>
          )}
        </AlertDescription>
      </Alert>
    </div>
  );
}
