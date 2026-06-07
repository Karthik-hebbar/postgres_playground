# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
npm run dev      # start dev server on http://localhost:3000
npm run build    # production build
npm run start    # run production build
```

There are no tests or lint scripts configured.

## Architecture

Single-page app with a three-column layout: schema explorer | query editor | results panel.

**Data flow:**
1. `src/app/page.tsx` — client component, owns `sql` state and orchestrates the three panels via props/callbacks
2. `src/hooks/useQueryRunner.ts` — POSTs to `/api/query`, tracks `idle | loading | success | error` state
3. `src/hooks/useSchema.ts` — GETs `/api/schema` on mount, exposes a `refresh()` callback
4. `src/hooks/useQueryHistory.ts` — persists up to 20 queries in `localStorage` under key `pg_playground_history`

**API routes** (all in `src/app/api/`):
- `POST /api/query` — runs arbitrary SQL against the pool; blocks `DROP DATABASE`, `CREATE DATABASE`, `pg_read_file`, `pg_ls_dir`, `COPY … TO`; always returns HTTP 200 (errors use `{ error, hint?, code? }` shape)
- `GET /api/schema` — queries `information_schema` for all non-system tables/columns, returns `{ tables: SchemaTable[], database: string }`
- `POST /api/seed` — drops and recreates the playground schema (8 tables: departments, employees, customers, categories, products, orders, order_items, reviews) with indexes and sample data

**Database connection:** `src/lib/db.ts` exposes a singleton `pg.Pool` configured from env vars (`PGHOST`, `PGPORT`, `PGDATABASE`, `PGUSER`, `PGPASSWORD`). The pool is attached to `global._pgPool` to survive hot reloads in dev.

**Shared types:** `src/lib/types.ts` — `QueryResult`, `QueryError`, `SchemaTable`, `Column`, `Snippet`, `HistoryEntry`.

**UI:** shadcn/ui components in `src/components/ui/` (Radix-based). Feature components are grouped under `src/components/editor/`, `src/components/results/`, and `src/components/schema/`. The app uses dark mode only (hardcoded `dark` class on `<html>`), IBM Plex Mono font, and Tailwind CSS v4.

## Environment

Copy `.env.local` and set these vars to point at a running PostgreSQL instance:

```
PGHOST=localhost
PGPORT=5432
PGDATABASE=postgres
PGUSER=<user>
PGPASSWORD=<password>
```

After connecting, hit `POST /api/seed` (or use the "Seed" button in the UI) to populate the playground schema.
