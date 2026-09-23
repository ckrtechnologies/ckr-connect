require('dotenv').config();
const { Pool } = require('pg');
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function run() {
  const { rows } = await pool.query("SELECT id, name, email, date_of_joining FROM connect.users WHERE name = 'b1'");
  console.log(rows);
  pool.end();
}
run();
