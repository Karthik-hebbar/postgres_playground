"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { QueryResult } from "@/lib/types";

// OID → human-readable type label (common subset)
const OID_LABELS: Record<number, string> = {
  16: "bool",
  17: "bytea",
  20: "int8",
  21: "int2",
  23: "int4",
  25: "text",
  114: "json",
  700: "float4",
  701: "float8",
  1043: "varchar",
  1082: "date",
  1083: "time",
  1114: "timestamp",
  1184: "timestamptz",
  1700: "numeric",
  2950: "uuid",
  3802: "jsonb",
};

function typeLabel(dataTypeID: number): string {
  return OID_LABELS[dataTypeID] ?? `oid:${dataTypeID}`;
}

function CellValue({ value }: { value: unknown }) {
  if (value === null || value === undefined) {
    return <span className="text-muted-foreground/50 italic">null</span>;
  }
  if (typeof value === "object") {
    return <span>{JSON.stringify(value)}</span>;
  }
  return <span>{String(value)}</span>;
}

interface ResultsTableProps {
  result: QueryResult;
}

export function ResultsTable({ result }: ResultsTableProps) {
  const { rows, fields } = result;

  if (rows.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-8 w-8 opacity-30"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M3 10h18M3 14h18M10 4v16M14 4v16"
          />
        </svg>
        <span className="text-sm">0 rows returned</span>
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={300}>
      <ScrollArea className="h-full w-full" type="always">
        <div className="min-w-max">
          <Table className="font-mono text-xs">
            <TableHeader className="sticky top-0 z-10 bg-card shadow-sm">
              <TableRow className="border-border hover:bg-transparent">
                {fields.map((field) => (
                  <TableHead
                    key={field.name}
                    className="h-8 px-3 text-xs font-semibold text-muted-foreground whitespace-nowrap border-r border-border/40 last:border-0"
                  >
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="cursor-default">{field.name}</span>
                      </TooltipTrigger>
                      <TooltipContent side="bottom" className="font-mono text-xs">
                        {typeLabel(field.dataTypeID)}
                      </TooltipContent>
                    </Tooltip>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((row, i) => (
                <TableRow
                  key={i}
                  className={`border-border/30 hover:bg-muted/30 ${
                    i % 2 === 1 ? "bg-muted/10" : ""
                  }`}
                >
                  {fields.map((field) => (
                    <TableCell
                      key={field.name}
                      className="px-3 py-1.5 align-top whitespace-nowrap max-w-[300px] overflow-hidden text-ellipsis border-r border-border/20 last:border-0"
                    >
                      <CellValue value={row[field.name]} />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </ScrollArea>
    </TooltipProvider>
  );
}
