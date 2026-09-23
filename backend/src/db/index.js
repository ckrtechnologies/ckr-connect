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
  // Supavisor allows 100 client connections (POOLER_MAX_CLIENT_CONN=100)
  // and multiplexes them onto 5 real DB connections (transaction mode).
  // So we can safely use more client-side connections.
  max: 10,
  // In transaction-mode pooling, Supavisor reclaims server connections
  // after each query. Keep idle timeout very short so Node.js doesn't
  // try to reuse a connection that Supavisor already recycled.
  idleTimeoutMillis: 2000,
  // Fail fast on connection attempts — better to retry quickly than hang for 10s
  connectionTimeoutMillis: 5000,
  // TCP keepalive detects dead sockets (OS keepalive_time is now 60s)
  keepAlive: true,
  keepAliveInitialDelayMillis: 500,
  // Query guard rails
  statement_timeout: 15000,
  query_timeout: 15000,
  // Allow connections to be destroyed and recreated rather than reused stale
  allowExitOnIdle: false,
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

