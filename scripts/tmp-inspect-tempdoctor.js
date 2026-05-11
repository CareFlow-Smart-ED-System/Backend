const { Pool } = require('pg');
(async () => {
  const pool = new Pool({ user: 'postgres', host: '127.0.0.1', database: 'ed_system', port: 5432 });
  const user = await pool.query('SELECT u.id, u.email, u.role, d.id as doctor_id FROM "User" u LEFT JOIN "Doctor" d ON d."userId" = u.id WHERE u.email = $1', ['tempdoctor@careflow.com']);
  const assign = await pool.query('SELECT * FROM "CaseDoctor" WHERE "caseId" = $1 ORDER BY "assignedAt" DESC', ['e35dc201-4c89-4694-92f4-f98a32e389a1']);
  console.log(JSON.stringify({ user: user.rows, assign: assign.rows }, null, 2));
  await pool.end();
})();
