import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import logger from './logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.resolve(__dirname, '../../rayeva.db');
const db = new Database(dbPath);

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS ai_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    context TEXT,
    prompt TEXT,
    response TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    description TEXT,
    primary_category TEXT,
    sub_category TEXT,
    seo_tags TEXT,
    sustainability_filters TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS proposals (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_name TEXT,
    budget_limit REAL,
    product_mix TEXT,
    budget_allocation TEXT,
    impact_summary TEXT,
    client_fit TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

logger.info('SQLite Database initialized successfully', { dbPath });

export default db;
