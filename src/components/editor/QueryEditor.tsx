"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import hljs from "highlight.js/lib/core";
import sql from "highlight.js/lib/languages/sql";
import { EditorToolbar } from "./EditorToolbar";
import { SnippetsPanel } from "./SnippetsPanel";
import { useQueryHistory } from "@/hooks/useQueryHistory";

hljs.registerLanguage("sql", sql);

interface QueryEditorProps {
  sql: string;
  onChange: (sql: string) => void;
  onRun: () => void;
  isLoading: boolean;
}

export function QueryEditor({ sql: value, onChange, onRun, isLoading }: QueryEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  const { history, push, clear } = useQueryHistory();
  const [highlighted, setHighlighted] = useState("");

  useEffect(() => {
    const result = hljs.highlight(value || " ", { language: "sql" });
    // Append trailing newline so cursor on last line doesn't collapse
    setHighlighted(result.value + "\n");
  }, [value]);

  // Sync scroll between textarea and highlight overlay
  const syncScroll = useCallback(() => {
    if (textareaRef.current && highlightRef.current) {
      highlightRef.current.scrollTop = textareaRef.current.scrollTop;
      highlightRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        if (!isLoading) {
          push(value);
          onRun();
        }
      }
      // Tab → insert 2 spaces
      if (e.key === "Tab") {
        e.preventDefault();
        const ta = textareaRef.current;
        if (!ta) return;
        const start = ta.selectionStart;
        const end = ta.selectionEnd;
        const next = value.substring(0, start) + "  " + value.substring(end);
        onChange(next);
        requestAnimationFrame(() => {
          ta.selectionStart = ta.selectionEnd = start + 2;
        });
      }
    },
    [isLoading, onRun, push, value, onChange]
  );

  const handleRun = useCallback(() => {
    push(value);
    onRun();
  }, [push, value, onRun]);

  const handleHistorySelect = useCallback(
    (sql: string) => {
      onChange(sql);
    },
    [onChange]
  );

  const handleInsertSnippet = useCallback(
    (snippet: string) => {
      onChange(snippet);
      textareaRef.current?.focus();
    },
    [onChange]
  );

  return (
    <div className="flex flex-col h-full bg-card border-r border-border">
      <EditorToolbar
        onRun={handleRun}
        isLoading={isLoading}
        history={history}
        onHistorySelect={handleHistorySelect}
        onHistoryClear={clear}
      />

      {/* Editor area */}
      <div className="relative flex-1 overflow-hidden font-mono text-sm leading-6">
        {/* Syntax-highlighted mirror */}
        <div
          ref={highlightRef}
          aria-hidden
          className="hljs absolute inset-0 p-4 overflow-hidden whitespace-pre-wrap break-words pointer-events-none select-none"
          dangerouslySetInnerHTML={{ __html: highlighted }}
        />
        {/* Actual textarea (transparent text, caret visible) */}
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onScroll={syncScroll}
          spellCheck={false}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          className="absolute inset-0 w-full h-full p-4 bg-transparent text-transparent caret-primary resize-none outline-none font-mono text-sm leading-6 overflow-auto"
          placeholder="-- Write your SQL here..."
          style={{ caretColor: "#4ade80" }}
        />
      </div>

      <SnippetsPanel onInsert={handleInsertSnippet} />
    </div>
  );
}
