// Database abstraction layer
// Uses local SQLite for development, D1 for production

import type { D1Database } from '@cloudflare/workers-types';
import { getCloudflareContext } from '@opennextjs/cloudflare';

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

// Get database instance
export function getDB(): D1Database | LocalDB {
  try {
    // Try OpenNext's getCloudflareContext first
    const { env } = getCloudflareContext();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const envAny = env as any;
    if (envAny && envAny.DB) {
      return envAny.DB as D1Database;
    }
  } catch {
    // Not in Cloudflare context, use local database
  }

  // Local development
  return getLocalDatabase();
}

// Get environment variables
export function getEnvVar(key: string): string {
  try {
    // Try OpenNext's getCloudflareContext first
    const { env } = getCloudflareContext();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const envAny = env as any;
    if (envAny) {
      const value = envAny[key];
      if (typeof value === 'string') return value;
    }
  } catch {
    // Not in Cloudflare context
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

/**
 * Upsert a customer from order data. If a customer with the same email exists
 * for the tenant, update their name/phone and increment total_orders.
 * Otherwise create a new customer.
 */
export async function upsertClientFromOrder(
  customerName: string,
  customerEmail: string,
  customerPhone: string,
  tenantId: string = 'bakes-by-coral'
) {
  try {
    const db = getDB();
    const existing = await db.prepare(
      'SELECT id FROM customers WHERE email = ? AND tenant_id = ?'
    ).bind(customerEmail, tenantId).first<{ id: string }>();

    if (existing) {
      await db.prepare(
        'UPDATE customers SET name = ?, phone = ?, total_orders = total_orders + 1, updated_at = datetime(\'now\') WHERE id = ?'
      ).bind(customerName, customerPhone, existing.id).run();
    } else {
      const id = `cust_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      await db.prepare(
        'INSERT INTO customers (id, name, email, phone, total_orders, tenant_id) VALUES (?, ?, ?, ?, 1, ?)'
      ).bind(id, customerName, customerEmail, customerPhone, tenantId).run();
    }
  } catch (error) {
    // Non-fatal: don't break order submission if customer upsert fails
    console.error('Customer upsert error (non-fatal):', error);
  }
}
