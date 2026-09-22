import pg from 'pg';
import { secrets } from '../config/secrets.js';

const { Pool } = pg;

/**
 * Intelligent host resolver (matching dailyfresh/backend/src/db/index.js):
 * If running on Linux VPS and host is configured as db.ckrtechnologies.in,
 * redirect to 127.0.0.1 to avoid Linux hairpin NAT connection drops.
 */
const resolveHost = (targetHost) => {
  if (!targetHost) return '127.0.0.1';
  if (process.platform === 'linux' && (targetHost === 'db.ckrtechnologies.in' || targetHost === '45.122.121.248')) {
    console.log(`[DB] Linux VPS detected: automatically routing ${targetHost} -> 127.0.0.1 for local loopback speed`);
    return '127.0.0.1';
  }
  return targetHost;
};

/**
 * Shared PostgreSQL connection pool configured for CKR Connect schema.
 * Reused exclusively across all domain repositories per AGENTS.md §9.
 */
export const pool = new Pool({
  host: resolveHost(secrets.db.host),
  port: secrets.db.port,
  database: secrets.db.database,
  user: secrets.db.user,
  password: secrets.db.password,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
  ssl: false,
  options: '-c search_path=connect,extensions,public'
});

pool.on('error', (err) => {
  console.error('[DATABASE] Unexpected pool client error:', err.message);
});

/**
 * Standard query execution helper
 * @param {string} text 
 * @param {Array<any>} [params] 
 */
export const query = (text, params) => pool.query(text, params);
export const db = pool;
export default pool;

