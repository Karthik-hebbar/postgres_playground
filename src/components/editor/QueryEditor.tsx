"use client";

import { useRef, useEffect, useCallback } from "react";
import hljs from "highlight.js/lib/core";
import sql from "highlight.js/lib/languages/sql";
import { EditorToolbar } from "./EditorToolbar";
import { SnippetsPanel } from "./SnippetsPanel";
import { useQueryHistory } from "@/hooks/useQueryHistory";

hljs.registerLanguage("sql", sql);

function applyHighlight(text: string): string {
  return hljs.highlight(text || " ", { language: "sql" }).value + "\n";
}

// Returns caret character offset within a contenteditable element.
function getCaretOffset(root: HTMLElement): number {
  const sel = window.getSelection();
  if (!sel || !sel.rangeCount) return 0;
  const range = sel.getRangeAt(0);
  const pre = document.createRange();
  pre.setStart(root, 0);
  pre.setEnd(range.startContainer, range.startOffset);
  return pre.toString().length;
}

// Restores the caret to `offset` characters into a contenteditable element.
function setCaretOffset(root: HTMLElement, offset: number): void {
  const walk = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  let remaining = offset;
  let node: Text | null;
  while ((node = walk.nextNode() as Text | null)) {
    if (remaining <= node.length) {
      const range = document.createRange();
      range.setStart(node, remaining);
      range.collapse(true);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
      return;
    }
    remaining -= node.length;
  }
  // Offset past end — place caret at end
  const range = document.createRange();
  range.selectNodeContents(root);
  range.collapse(false);
  window.getSelection()?.removeAllRanges();
  window.getSelection()?.addRange(range);
}

// Plain text from a contenteditable. innerText adds a trailing \n we strip.
function extractText(el: HTMLElement): string {
  return el.innerText.replace(/\n$/, "");
}

interface QueryEditorProps {
  sql: string;
  onChange: (sql: string) => void;
  onRun: () => void;
  isLoading: boolean;
}

export function QueryEditor({
  sql: value,
  onChange,
  onRun,
  isLoading,
}: QueryEditorProps) {
  const editableRef = useRef<HTMLDivElement>(null);
  const { history, push, clear } = useQueryHistory();

  // Set initial content on mount — don't use dangerouslySetInnerHTML alongside
  // onInput; they fight each other on every React render.
  useEffect(() => {
    if (editableRef.current) {
      editableRef.current.innerHTML = applyHighlight(value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync prop → DOM when value is changed from outside (snippet, history,
  // table click). Skip when DOM already matches to avoid a cursor reset.
  useEffect(() => {
    const el = editableRef.current;
    if (!el) return;
    if (extractText(el) === value) return;
    el.innerHTML = applyHighlight(value);
    // Move caret to end of new content
    setCaretOffset(el, value.length);
  }, [value]);

  // Re-highlight after every keystroke, preserving caret position.
  const handleInput = useCallback(() => {
    const el = editableRef.current;
    if (!el) return;
    const offset = getCaretOffset(el);
    const text = extractText(el);
    el.innerHTML = applyHighlight(text);
    setCaretOffset(el, offset);
    onChange(text);
  }, [onChange]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        if (!isLoading) {
          push(value);
          onRun();
        }
      }
      if (e.key === "Tab") {
        e.preventDefault();
        // execCommand triggers an input event which re-highlights automatically
        document.execCommand("insertText", false, "  ");
      }
    },
    [isLoading, onRun, push, value]
  );

  // Strip rich-text formatting on paste
  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLDivElement>) => {
      e.preventDefault();
      document.execCommand("insertText", false, e.clipboardData.getData("text/plain"));
    },
    []
  );

  const handleRun = useCallback(() => {
    push(value);
    onRun();
  }, [push, value, onRun]);

  const handleHistorySelect = useCallback(
    (s: string) => onChange(s),
    [onChange]
  );

  const handleInsertSnippet = useCallback(
    (snippet: string) => {
      onChange(snippet);
      editableRef.current?.focus();
    },
    [onChange]
  );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        borderRight: "1px solid var(--border)",
        background: "var(--card)",
      }}
    >
      <EditorToolbar
        onRun={handleRun}
        isLoading={isLoading}
        history={history}
        onHistorySelect={handleHistorySelect}
        onHistoryClear={clear}
      />

      {/* Single element: no overlay, no alignment problem */}
      <div
        ref={editableRef}
        contentEditable
        suppressContentEditableWarning
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        spellCheck={false}
        data-placeholder="-- Write your SQL here..."
        className="hljs"
        style={{
          flex: 1,
          padding: "16px",
          fontFamily: '"IBM Plex Mono", "Fira Code", ui-monospace, monospace',
          fontSize: "13.5px",
          lineHeight: "22px",
          outline: "none",
          overflow: "auto",
          whiteSpace: "pre",
          caretColor: "#4ade80",
          cursor: "text",
          tabSize: 2,
          color: "#e2e8f0",
          minHeight: 0,
        }}
      />

      <SnippetsPanel onInsert={handleInsertSnippet} />
    </div>
  );
}
