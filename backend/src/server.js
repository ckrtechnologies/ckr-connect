import app from './app.js';
import { secrets } from './config/secrets.js';
import { db } from './db/index.js';

const startServer = async () => {
  try {
    const { rows } = await db.query('SELECT current_user, current_database() AS current_database, current_schema() AS current_schema');
    console.log(`[Database] Connected successfully as "${rows[0].current_user}" to "${rows[0].current_database}" (search_path schema: "${rows[0].current_schema}")`);

    const server = app.listen(secrets.port, () => {
      console.log(`=======================================================`);
      console.log(`  CKR Connect Enterprise API running on port ${secrets.port}  `);
      console.log(`  Environment: ${secrets.nodeEnv}                         `);
      console.log(`  Health Check: http://localhost:${secrets.port}/health   `);
      console.log(`=======================================================`);
    });

    const shutdown = async (signal) => {
      console.log(`\n[Server] Received ${signal}. Gracefully shutting down...`);
      server.close(async () => {
        console.log('[Server] HTTP server closed.');
        try {
          await db.end();
          console.log('[Database] Connection pool closed.');
          process.exit(0);
        } catch (err) {
          console.error('[Database] Error closing pool:', err);
          process.exit(1);
        }
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (err) {
    console.error('[Server] Failed to initialize server:', err);
    process.exit(1);
  }
};

startServer();
