"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

interface ResizeDividerProps {
  onMouseDown: (e: React.MouseEvent) => void;
}

export function ResizeDivider({ onMouseDown }: ResizeDividerProps) {
  const [active, setActive] = useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    setActive(true);
    const onUp = () => {
      setActive(false);
      document.removeEventListener("mouseup", onUp);
    };
    document.addEventListener("mouseup", onUp);
    onMouseDown(e);
  };

  return (
    <div
      onMouseDown={handleMouseDown}
      className={cn(
        "w-1 shrink-0 cursor-col-resize select-none transition-colors duration-100",
        active ? "bg-primary" : "bg-border hover:bg-primary/50"
      )}
    />
  );
}
