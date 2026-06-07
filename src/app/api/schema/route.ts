import { NextResponse } from "next/server";
import pool, { getDatabaseName } from "@/lib/db";
import type { SchemaTable, Column } from "@/lib/types";

const SCHEMA_QUERY = `
  SELECT
    c.table_schema,
    c.table_name,
    c.column_name,
    c.data_type,
    c.is_nullable,
    c.column_default,
    CASE WHEN kcu.column_name IS NOT NULL THEN true ELSE false END AS is_primary_key
  FROM information_schema.columns c
  LEFT JOIN information_schema.table_constraints tc
    ON tc.table_schema = c.table_schema
    AND tc.table_name = c.table_name
    AND tc.constraint_type = 'PRIMARY KEY'
  LEFT JOIN information_schema.key_column_usage kcu
    ON kcu.constraint_name = tc.constraint_name
    AND kcu.table_schema = c.table_schema
    AND kcu.table_name = c.table_name
    AND kcu.column_name = c.column_name
  WHERE c.table_schema NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
  ORDER BY c.table_schema, c.table_name, c.ordinal_position;
`;

type RawRow = {
  table_schema: string;
  table_name: string;
  column_name: string;
  data_type: string;
  is_nullable: string;
  column_default: string | null;
  is_primary_key: boolean;
};

export async function GET(): Promise<NextResponse> {
  try {
    const result = await pool.query<RawRow>(SCHEMA_QUERY);

    const tableMap = new Map<string, SchemaTable>();

    for (const row of result.rows) {
      const key = `${row.table_schema}.${row.table_name}`;
      if (!tableMap.has(key)) {
        tableMap.set(key, {
          schema: row.table_schema,
          name: row.table_name,
          columnCount: 0,
          columns: [],
        });
      }
      const table = tableMap.get(key)!;
      const column: Column = {
        name: row.column_name,
        type: row.data_type,
        nullable: row.is_nullable === "YES",
        isPrimaryKey: row.is_primary_key,
        default: row.column_default,
      };
      table.columns.push(column);
      table.columnCount = table.columns.length;
    }

    return NextResponse.json({
      tables: Array.from(tableMap.values()),
      database: getDatabaseName(),
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
