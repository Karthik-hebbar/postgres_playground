export type QueryField = { name: string; dataTypeID: number };

export type QueryResult = {
  rows: Record<string, unknown>[];
  fields: QueryField[];
  rowCount: number;
  duration: number;
};

export type QueryError = {
  error: string;
  hint?: string;
  code?: string;
  duration?: number;
};

export type Column = {
  name: string;
  type: string;
  nullable: boolean;
  isPrimaryKey: boolean;
  default: string | null;
};

export type SchemaTable = {
  schema: string;
  name: string;
  columnCount: number;
  columns: Column[];
};

export type Snippet = {
  label: string;
  description: string;
  sql: string;
};

export type HistoryEntry = {
  sql: string;
  timestamp: number;
};
