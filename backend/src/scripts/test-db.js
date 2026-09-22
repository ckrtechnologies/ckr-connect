import { pool } from '../db/index.js';

async function testConnection() {
  console.log('Testing connection to PostgreSQL database at db.ckrtechnologies.in...');
  try {
    const res = await pool.query(`
      SELECT current_database(), current_user, current_schema(), version();
    `);
    console.log('Handshake successful:', res.rows[0]);

    const tablesRes = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'connect'
      ORDER BY table_name;
    `);
    console.log('Tables in connect schema:', tablesRes.rows.map(r => r.table_name));
    process.exit(0);
  } catch (err) {
    console.error('Connection failed:', err.message);
    process.exit(1);
  }
}

testConnection();
