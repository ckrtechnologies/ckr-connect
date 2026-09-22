import dotenv from 'dotenv';
dotenv.config();

const baseUser = process.env.DB_USER || 'connect_user';
const tenantId = process.env.POOLER_TENANT_ID || 'your-tenant-id';
const dbUser = baseUser.includes('.') ? baseUser : `${baseUser}.${tenantId}`;

/**
 * Centrally managed application secrets and environment variables.
 * Per AGENTS.md §6, only this file reads process.env directly.
 */
export const secrets = {
  app: {
    port: parseInt(process.env.PORT || '4000', 10),
    env: process.env.NODE_ENV || 'development',
    corsOrigins: (process.env.CORS_ORIGIN || 'http://localhost:5173,http://localhost:3000,https://connect.ckrtechnologies.in')
      .split(',')
      .map(o => o.trim())
  },
  db: {
    host: process.env.DB_HOST || 'db.ckrtechnologies.in',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_NAME || 'postgres',
    user: dbUser,
    password: process.env.DB_PASSWORD || 'password@1',
    tenantId: tenantId,
    connectionString: process.env.DATABASE_URL || `postgresql://${dbUser}:${encodeURIComponent(process.env.DB_PASSWORD || 'password@1')}@${process.env.DB_HOST || 'db.ckrtechnologies.in'}:5432/postgres`
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'ckr_connect_super_secret_jwt_key_2026_enterprise_isolated',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'ckr_connect_super_secret_refresh_jwt_key_2026_isolated',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d'
  },
  files: {
    dir: process.env.FILES_DIR || './uploads',
    maxSizeMb: parseInt(process.env.MAX_FILE_SIZE_MB || '25', 10)
  }
};
