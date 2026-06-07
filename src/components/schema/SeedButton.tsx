"use client";

import { useState } from "react";
import { DatabaseZap, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";

type SeedState = "idle" | "confirming" | "loading" | "success" | "error";

interface SeedButtonProps {
  onSeeded: () => void;
}

export function SeedButton({ onSeeded }: SeedButtonProps) {
  const [seedState, setSeedState] = useState<SeedState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [open, setOpen] = useState(false);

  async function runSeed() {
    setSeedState("loading");
    try {
      const res = await fetch("/api/seed", { method: "POST" });
      const data = (await res.json()) as { ok: boolean; error?: string };
      if (data.ok) {
        setSeedState("success");
        setTimeout(() => {
          setOpen(false);
          setSeedState("idle");
          onSeeded();
        }, 1800);
      } else {
        setErrorMsg(data.error ?? "Unknown error");
        setSeedState("error");
      }
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : "Network error");
      setSeedState("error");
    }
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      setSeedState("idle");
      setErrorMsg("");
    }
  }

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 shrink-0 text-muted-foreground hover:text-primary"
          title="Seed test database"
        >
          <DatabaseZap className="h-3.5 w-3.5" />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        side="bottom"
        align="start"
        className="w-72 p-0 font-mono text-xs"
      >
        {/* Header */}
        <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border">
          <DatabaseZap className="h-3.5 w-3.5 text-primary shrink-0" />
          <span className="font-semibold text-sm text-foreground">
            Seed test database
          </span>
        </div>

        {/* Body */}
        <div className="px-3 py-2.5 space-y-2.5">
          {(seedState === "idle" || seedState === "confirming") && (
            <>
              <p className="text-muted-foreground leading-relaxed">
                Creates 8 tables with sample data for practicing:
              </p>
              <ul className="space-y-0.5 text-muted-foreground/80">
                {[
                  "customers · orders · order_items",
                  "products · categories",
                  "reviews · employees · departments",
                ].map((line) => (
                  <li key={line} className="flex items-start gap-1.5">
                    <span className="text-primary mt-px">›</span>
                    {line}
                  </li>
                ))}
              </ul>
              <div className="text-[10px] text-destructive/80 bg-destructive/10 rounded px-2 py-1.5 leading-relaxed border border-destructive/20">
                ⚠ Drops and recreates these tables if they already exist.
              </div>
              <Separator />
              <div className="flex gap-2 pt-0.5">
                <Button
                  size="sm"
                  className="h-7 flex-1 text-xs bg-primary text-primary-foreground hover:bg-primary/90"
                  onClick={runSeed}
                >
                  Create tables + seed data
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs"
                  onClick={() => handleOpenChange(false)}
                >
                  Cancel
                </Button>
              </div>
            </>
          )}

          {seedState === "loading" && (
            <div className="flex items-center gap-2 py-2 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              Seeding database…
            </div>
          )}

          {seedState === "success" && (
            <div className="flex items-start gap-2 py-1 text-primary">
              <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
              <span className="leading-relaxed">
                Done! 8 tables created with indexes and sample data. Schema
                panel refreshing…
              </span>
            </div>
          )}

          {seedState === "error" && (
            <div className="space-y-2">
              <div className="flex items-start gap-2 text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{errorMsg}</span>
              </div>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs w-full"
                onClick={() => {
                  setSeedState("idle");
                  setErrorMsg("");
                }}
              >
                Try again
              </Button>
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
