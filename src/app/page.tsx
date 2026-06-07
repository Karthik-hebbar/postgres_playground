"use client";

import { useState, useCallback } from "react";
import { SchemaExplorer } from "@/components/schema/SchemaExplorer";
import { QueryEditor } from "@/components/editor/QueryEditor";
import { ResultsPanel } from "@/components/results/ResultsPanel";
import { useQueryRunner } from "@/hooks/useQueryRunner";

export default function Page() {
  const [sql, setSql] = useState("SELECT version();");
  const { state, run } = useQueryRunner();

  const handleRun = useCallback(() => {
    run(sql);
  }, [run, sql]);

  const handleTableSelect = useCallback((query: string) => {
    setSql(query);
  }, []);

  return (
    <div className="flex h-full w-full overflow-hidden">
      {/* Left: Schema Explorer — fixed 240px */}
      <div className="w-60 shrink-0 flex flex-col overflow-hidden">
        <SchemaExplorer onTableSelect={handleTableSelect} />
      </div>

      {/* Center: Query Editor — fixed ~420px */}
      <div className="w-[420px] shrink-0 flex flex-col overflow-hidden">
        <QueryEditor
          sql={sql}
          onChange={setSql}
          onRun={handleRun}
          isLoading={state.status === "loading"}
        />
      </div>

      {/* Right: Results — flex-1, takes remaining space */}
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden border-l border-border">
        <ResultsPanel state={state} />
      </div>
    </div>
  );
}
