import { Pool } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var _pgPool: Pool | undefined;
}

function createPool(): Pool {
  return new Pool({
    host: process.env.PGHOST ?? "localhost",
    port: parseInt(process.env.PGPORT ?? "5432", 10),
    database: process.env.PGDATABASE ?? "postgres",
    user: process.env.PGUSER ?? "postgres",
    password: process.env.PGPASSWORD ?? "",
    connectionTimeoutMillis: 5000,
    max: 10,
  });
}

// Reuse pool across hot reloads in dev
const pool = global._pgPool ?? createPool();
if (process.env.NODE_ENV !== "production") {
  global._pgPool = pool;
}

export default pool;

export function getDatabaseName(): string {
  return process.env.PGDATABASE ?? "postgres";
}
