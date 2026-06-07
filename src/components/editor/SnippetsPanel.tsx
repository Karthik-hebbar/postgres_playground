"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SNIPPETS } from "@/constants/snippets";

interface SnippetsPanelProps {
  onInsert: (sql: string) => void;
}

export function SnippetsPanel({ onInsert }: SnippetsPanelProps) {
  return (
    <div className="border-t border-border bg-card/50">
      <Accordion type="single" collapsible>
        <AccordionItem value="snippets" className="border-0">
          <AccordionTrigger className="px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:no-underline font-mono">
            SQL Snippets
          </AccordionTrigger>
          <AccordionContent className="pb-0">
            <div className="flex flex-col max-h-[180px] overflow-y-auto">
              {SNIPPETS.map((snippet) => (
                <button
                  key={snippet.label}
                  className="flex flex-col items-start px-3 py-1.5 text-left hover:bg-muted/60 transition-colors border-t border-border/30 first:border-0 cursor-pointer"
                  onClick={() => onInsert(snippet.sql)}
                >
                  <span className="text-xs font-mono text-primary font-medium">
                    {snippet.label}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {snippet.description}
                  </span>
                </button>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
