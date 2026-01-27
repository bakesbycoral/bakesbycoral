// Database abstraction layer
// Uses local SQLite for development, D1 for production

import type { D1Database } from '@cloudflare/workers-types';

// Type for query results
interface QueryResult<T> {
  results: T[];
  success: boolean;
  meta?: {
    duration: number;
    changes?: number;
    last_row_id?: number;
  };
}

// D1-compatible interface for local SQLite
interface LocalDB {
  prepare(sql: string): LocalStatement;
  batch(statements: LocalStatement[]): Promise<unknown[]>;
}

interface LocalStatement {
  bind(...params: unknown[]): LocalStatement;
  first<T>(): Promise<T | null>;
  all<T>(): Promise<QueryResult<T>>;
  run(): Promise<{ success: boolean; meta: { changes: number } }>;
  // Internal properties for batch execution
  _sql?: string;
  _params?: unknown[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let sqliteInstance: any = null;

function getLocalDatabase(): LocalDB {
  // Only import better-sqlite3 in development (Node.js environment)
  if (!sqliteInstance) {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const Database = require('better-sqlite3');
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const path = require('path');

    const dbPath = path.join(process.cwd(), '.dev.db');
    sqliteInstance = new Database(dbPath);

    // Enable foreign keys
    sqliteInstance.pragma('foreign_keys = ON');
  }

  // Create D1-compatible wrapper
  return {
    prepare(sql: string) {
      let boundParams: unknown[] = [];

      const statement = {
        _sql: sql,
        _params: [] as unknown[],

        bind(...params: unknown[]) {
          boundParams = params;
          statement._params = params;
          return statement;
        },

        async first<T>(): Promise<T | null> {
          try {
            const stmt = sqliteInstance.prepare(sql);
            const result = stmt.get(...boundParams) as T | undefined;
            return result || null;
          } catch (error) {
            console.error('DB first() error:', error);
            return null;
          }
        },

        async all<T>(): Promise<QueryResult<T>> {
          try {
            const stmt = sqliteInstance.prepare(sql);
            const results = stmt.all(...boundParams) as T[];
            return { results, success: true };
          } catch (error) {
            console.error('DB all() error:', error);
            return { results: [], success: false };
          }
        },

        async run(): Promise<{ success: boolean; meta: { changes: number } }> {
          try {
            const stmt = sqliteInstance.prepare(sql);
            const result = stmt.run(...boundParams);
            return {
              success: true,
              meta: { changes: result.changes }
            };
          } catch (error) {
            console.error('DB run() error:', error);
            return { success: false, meta: { changes: 0 } };
          }
        },
      };

      return statement;
    },

    async batch(statements: LocalStatement[]): Promise<unknown[]> {
      const results: unknown[] = [];
      try {
        // Run all statements in a transaction for consistency
        sqliteInstance.exec('BEGIN TRANSACTION');
        for (const stmt of statements) {
          // Access the internal SQL and params
          const stmtAny = stmt as { _sql?: string; _params?: unknown[] };
          if (stmtAny._sql) {
            const prepared = sqliteInstance.prepare(stmtAny._sql);
            const result = prepared.run(...(stmtAny._params || []));
            results.push({ success: true, meta: { changes: result.changes } });
          }
        }
        sqliteInstance.exec('COMMIT');
      } catch (error) {
        console.error('DB batch() error:', error);
        sqliteInstance.exec('ROLLBACK');
        throw error;
      }
      return results;
    },
  };
}

// Check if we're in a Cloudflare environment
const cloudflareRequestContextSymbol = Symbol.for('__cloudflare-request-context__');

function getRequestContextSafe() {
  return (globalThis as { [key: symbol]: unknown })[cloudflareRequestContextSymbol] as
    | { env: Record<string, string>; DB?: D1Database }
    | undefined;
}

function isCloudflare(): boolean {
  // Check for edge runtime indicators
  if (typeof EdgeRuntime !== 'undefined') return true;
  if (process.env.CF_PAGES === '1') return true;
  return Boolean(getRequestContextSafe());
}

// Get database instance
export function getDB(): D1Database | LocalDB {
  if (isCloudflare()) {
    const ctx = getRequestContextSafe();
    if (ctx && ctx.DB) return ctx.DB;
  }

  // Local development
  return getLocalDatabase();
}

// Get environment variables
export function getEnvVar(key: string): string {
  if (isCloudflare()) {
    const ctx = getRequestContextSafe();
    if (ctx && ctx.env) {
      return ctx.env[key] || '';
    }
  }

  // Local development - use process.env
  return process.env[key] || '';
}

export function generateId(): string {
  return crypto.randomUUID();
}

export function now(): string {
  return new Date().toISOString();
}

// Declare EdgeRuntime for TypeScript
declare const EdgeRuntime: string | undefined;
