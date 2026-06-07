"use client";

import { useState, useCallback } from "react";
import { SchemaExplorer } from "@/components/schema/SchemaExplorer";
import { QueryEditor } from "@/components/editor/QueryEditor";
import { ResultsPanel } from "@/components/results/ResultsPanel";
import { ResizeDivider } from "@/components/ResizeDivider";
import { useQueryRunner } from "@/hooks/useQueryRunner";

const MIN_EDITOR_WIDTH = 280;
const MAX_EDITOR_WIDTH = 860;
const DEFAULT_EDITOR_WIDTH = 420;

export default function Page() {
  const [sql, setSql] = useState("SELECT version();");
  const [editorWidth, setEditorWidth] = useState(DEFAULT_EDITOR_WIDTH);
  const [schemaCollapsed, setSchemaCollapsed] = useState(false);
  const { state, run } = useQueryRunner();

  const handleRun = useCallback(() => {
    run(sql);
  }, [run, sql]);

  const handleTableSelect = useCallback((query: string) => {
    setSql(query);
  }, []);

  const handleDividerMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      const startX = e.clientX;
      const startW = editorWidth;

      const onMove = (mv: MouseEvent) => {
        setEditorWidth(
          Math.max(MIN_EDITOR_WIDTH, Math.min(MAX_EDITOR_WIDTH, startW + mv.clientX - startX))
        );
      };
      const onUp = () => {
        document.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseup", onUp);
      };

      document.addEventListener("mousemove", onMove);
      document.addEventListener("mouseup", onUp);
    },
    [editorWidth]
  );

  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* Left: Schema Explorer — collapsible */}
      <div className={`${schemaCollapsed ? "w-9" : "w-60"} shrink-0 flex flex-col overflow-hidden transition-all duration-200`}>
        <SchemaExplorer
          onTableSelect={handleTableSelect}
          collapsed={schemaCollapsed}
          onToggleCollapse={() => setSchemaCollapsed((c) => !c)}
        />
      </div>

      {/* Center: Query Editor — user-resizable */}
      <div
        style={{ width: editorWidth }}
        className="shrink-0 flex flex-col overflow-hidden"
      >
        <QueryEditor
          sql={sql}
          onChange={setSql}
          onRun={handleRun}
          isLoading={state.status === "loading"}
        />
      </div>

      {/* Draggable divider */}
      <ResizeDivider onMouseDown={handleDividerMouseDown} />

      {/* Right: Results — takes remaining space */}
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        <ResultsPanel state={state} />
      </div>
    </div>
  );
}
