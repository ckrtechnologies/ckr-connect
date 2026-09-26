import { db } from './backend/src/db/index.js';
async function run() {
  const query = `
      SELECT 
        l.id,
        l.name AS lead_name,
        l.next_followup_date::text,
        l.next_followup_date
      FROM connect.leads l
      WHERE l.name ILIKE '%Matthew%'
  `;
  const { rows } = await db.query(query);
  console.log(rows);
  process.exit(0);
}
run();
