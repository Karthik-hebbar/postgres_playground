import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import type { QueryResult, QueryError } from "@/lib/types";

const BLOCKED_PATTERNS = [
  /\bDROP\s+DATABASE\b/i,
  /\bCREATE\s+DATABASE\b/i,
  /\bpg_read_file\s*\(/i,
  /\bpg_ls_dir\s*\(/i,
  /\bCOPY\s+.+\s+TO\b/i,
];

function isBlocked(sql: string): boolean {
  return BLOCKED_PATTERNS.some((pattern) => pattern.test(sql));
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  let body: { sql?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json<QueryError>(
      { error: "Invalid JSON body" },
      { status: 200 }
    );
  }

  const sql = body.sql?.trim();
  if (!sql) {
    return NextResponse.json<QueryError>({ error: "No SQL provided" });
  }

  if (isBlocked(sql)) {
    return NextResponse.json<QueryError>({
      error: "This operation is not permitted in the playground.",
    });
  }

  const start = performance.now();
  try {
    const result = await pool.query(sql);
    const duration = Math.round(performance.now() - start);

    const response: QueryResult = {
      rows: result.rows as Record<string, unknown>[],
      fields: (result.fields ?? []).map((f) => ({
        name: f.name,
        dataTypeID: f.dataTypeID,
      })),
      rowCount: result.rowCount ?? result.rows.length,
      duration,
    };

    return NextResponse.json(response);
  } catch (err: unknown) {
    const duration = Math.round(performance.now() - start);
    const pgError = err as { message?: string; hint?: string; code?: string };
    return NextResponse.json<QueryError>({
      error: pgError.message ?? "Unknown error",
      hint: pgError.hint,
      code: pgError.code,
      duration,
    });
  }
}
