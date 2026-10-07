// Datenbank auf den aktuellen Stand bringen – läuft bei jedem Vercel-Build (npm run build) und lokal (npm run migrate).
// 1. Tabellen von Better Auth aus lib/auth-optionen.mjs (legt nur Fehlendes an)
// 2. eigene SQL-Dateien aus db/migrations in Reihenfolge, jede genau einmal (Tabelle schema_migration)
// Ohne DATABASE_URL wird übersprungen (z. B. Build ohne gesetzte Umgebungsvariablen) – mit deutlicher Warnung.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pg from 'pg';
import { getMigrations } from 'better-auth/db/migration';
import { authOptionen } from '../lib/auth-optionen.mjs';

const hier = path.dirname(fileURLToPath(import.meta.url));
if (!process.env.DATABASE_URL) {
  console.warn('⚠ DATABASE_URL ist nicht gesetzt – Migration übersprungen. Die App braucht eine Datenbank, um zu laufen.');
  process.exit(0);
}

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
const client = await pool.connect();
try {
  await client.query('select pg_advisory_lock(4711)'); // parallele Builds warten aufeinander

  const optionen = authOptionen(pool);
  optionen.secret = optionen.secret || 'nur-fuer-die-migration-nur-fuer-die-migration';
  const { toBeCreated, toBeAdded, runMigrations } = await getMigrations(optionen);
  if (toBeCreated.length || toBeAdded.length) {
    console.log(`Better Auth: neu ${toBeCreated.map(t => t.table).join(', ') || '–'} · ergänzt ${toBeAdded.map(t => t.table).join(', ') || '–'}`);
    await runMigrations();
  }

  await client.query('create table if not exists schema_migration (name text primary key, angewendet timestamptz not null default now())');
  const fertig = new Set((await client.query('select name from schema_migration')).rows.map(r => r.name));
  const ordner = path.join(hier, '..', 'db', 'migrations');
  for (const datei of fs.readdirSync(ordner).filter(f => f.endsWith('.sql')).sort()) {
    if (fertig.has(datei)) continue;
    await client.query('begin');
    try {
      await client.query(fs.readFileSync(path.join(ordner, datei), 'utf8'));
      await client.query('insert into schema_migration (name) values ($1)', [datei]);
      await client.query('commit');
      console.log('Migration angewendet:', datei);
    } catch (e) {
      await client.query('rollback');
      throw new Error(`Migration ${datei} fehlgeschlagen: ${e.message}`);
    }
  }
  console.log('✅ Datenbank ist aktuell');
} finally {
  await client.query('select pg_advisory_unlock(4711)').catch(() => {});
  client.release();
  await pool.end();
}
