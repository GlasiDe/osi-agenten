// Postgres-Verbindung (Neon: die gepoolte Verbindungs-URL in DATABASE_URL). Ein Pool je Funktionsinstanz.
import { Pool } from 'pg';
import { attachDatabasePool } from '@vercel/functions';

const g = globalThis as unknown as { osiPool?: Pool };

function neuerPool() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 5, idleTimeoutMillis: 10_000 });
  attachDatabasePool(pool); // Vercel schließt ruhende Verbindungen sauber, bevor die Instanz einfriert
  return pool;
}

export const pool: Pool = g.osiPool ?? (g.osiPool = neuerPool());

export async function abfrage<T = Record<string, unknown>>(text: string, werte: unknown[] = []): Promise<T[]> {
  const r = await pool.query(text, werte);
  return r.rows as T[];
}
