import fs from 'fs';
import path from 'path';
import os from 'os';
import logger from './logger.js';

/**
 * Lightweight, dependency-free data store.
 *
 * The project originally used better-sqlite3, but that is a native module that
 * (a) fails to compile on bleeding-edge Node and (b) needs a writable, non-
 * ephemeral filesystem that serverless hosts like Vercel don't provide. The
 * stored data here is an append-only audit log plus product/proposal records —
 * it never needs relational queries — so a tiny in-memory store with best-effort
 * JSON persistence gives the same behaviour with zero native dependencies and
 * runs identically on a laptop or in a serverless function.
 *
 * It exposes the same minimal surface the app uses: `db.prepare(sql).run(...)`.
 */

type Row = Record<string, unknown>;

interface Statement {
  run(...params: unknown[]): { changes: number; lastInsertRowid: number };
}

class SimpleStore {
  private tables: Record<string, Row[]> = {
    ai_logs: [],
    products: [],
    proposals: [],
  };
  private seq = 0;
  private persistPath: string | null;

  constructor() {
    this.persistPath = this.resolvePersistPath();
    this.load();
  }

  /** Pick the first writable location; null disables persistence (in-memory only). */
  private resolvePersistPath(): string | null {
    const candidates = [
      path.resolve(process.cwd(), 'rayeva-data.json'),
      path.join(os.tmpdir(), 'rayeva-data.json'),
    ];
    for (const p of candidates) {
      try {
        fs.writeFileSync(p, fs.existsSync(p) ? fs.readFileSync(p) : '{}');
        return p;
      } catch {
        /* try next */
      }
    }
    return null;
  }

  private load() {
    if (!this.persistPath) return;
    try {
      const raw = fs.readFileSync(this.persistPath, 'utf-8');
      const parsed = JSON.parse(raw || '{}');
      for (const k of Object.keys(this.tables)) {
        if (Array.isArray(parsed[k])) this.tables[k] = parsed[k];
      }
      this.seq = parsed.__seq ?? 0;
    } catch {
      /* fresh store */
    }
  }

  private persist() {
    if (!this.persistPath) return;
    try {
      fs.writeFileSync(
        this.persistPath,
        JSON.stringify({ ...this.tables, __seq: this.seq })
      );
    } catch {
      /* best-effort only */
    }
  }

  /**
   * Minimal INSERT parser: figures out the target table and column order from
   * the SQL string, then maps positional params to a row object. Anything that
   * isn't a recognised INSERT is treated as a no-op (e.g. CREATE TABLE).
   */
  prepare(sql: string): Statement {
    const insertMatch = sql.match(/insert\s+into\s+(\w+)\s*\(([^)]+)\)/i);

    return {
      run: (...params: unknown[]) => {
        if (!insertMatch) return { changes: 0, lastInsertRowid: 0 };

        const table = insertMatch[1].toLowerCase();
        const cols = insertMatch[2].split(',').map((c) => c.trim());
        if (!this.tables[table]) this.tables[table] = [];

        const row: Row = { id: ++this.seq };
        cols.forEach((col, i) => {
          row[col] = params[i];
        });
        row.created_at = new Date().toISOString();

        this.tables[table].push(row);
        this.persist();
        return { changes: 1, lastInsertRowid: this.seq };
      },
    };
  }

  /** No-op; schema creation isn't needed for the in-memory store. */
  exec(_sql: string) {
    /* intentionally empty */
  }
}

const db = new SimpleStore();
logger.info('Data store initialized (in-memory + best-effort JSON persistence).');

export default db;
