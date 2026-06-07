import type { Snippet } from "@/lib/types";

export const SNIPPETS: Snippet[] = [
  {
    label: "Basic SELECT",
    description: "Fetch rows from a table",
    sql: "SELECT * FROM table_name LIMIT 50;",
  },
  {
    label: "Filter",
    description: "WHERE clause",
    sql: "SELECT * FROM table_name WHERE column = 'value';",
  },
  {
    label: "Aggregate",
    description: "GROUP BY with COUNT",
    sql: "SELECT column, COUNT(*) FROM table_name GROUP BY column ORDER BY COUNT(*) DESC;",
  },
  {
    label: "Inner Join",
    description: "Join two tables",
    sql: "SELECT a.*, b.*\nFROM table_a a\nJOIN table_b b ON a.id = b.a_id;",
  },
  {
    label: "CTE",
    description: "Common Table Expression",
    sql: "WITH cte AS (\n  SELECT * FROM table_name WHERE condition\n)\nSELECT * FROM cte;",
  },
  {
    label: "Explain",
    description: "Query execution plan",
    sql: "EXPLAIN ANALYZE SELECT * FROM table_name WHERE column = 'value';",
  },
  {
    label: "Create Table",
    description: "New table with common columns",
    sql: "CREATE TABLE example (\n  id SERIAL PRIMARY KEY,\n  name TEXT NOT NULL,\n  created_at TIMESTAMPTZ DEFAULT NOW()\n);",
  },
  {
    label: "Insert",
    description: "Insert a row",
    sql: "INSERT INTO table_name (col1, col2)\nVALUES ('val1', 'val2')\nRETURNING *;",
  },
  {
    label: "Update",
    description: "Update rows",
    sql: "UPDATE table_name SET column = 'value' WHERE id = 1 RETURNING *;",
  },
  {
    label: "Delete",
    description: "Delete rows",
    sql: "DELETE FROM table_name WHERE id = 1 RETURNING *;",
  },
];
