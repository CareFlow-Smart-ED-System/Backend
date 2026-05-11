const { Pool } = require('pg');
(async () => {
  const pool = new Pool({ user: 'postgres', host: '127.0.0.1', database: 'ed_system', port: 5432 });
  const doctors = await pool.query('SELECT u.id as user_id, u.email, u.role, d.id as doctor_id FROM "User" u JOIN "Doctor" d ON d."userId" = u.id ORDER BY u.email');
  const caseDoctor = await pool.query('SELECT "caseId", "doctorId", role FROM "CaseDoctor" ORDER BY "assignedAt" DESC LIMIT 10');
  console.log(JSON.stringify({ doctors: doctors.rows, caseDoctor: caseDoctor.rows }, null, 2));
  await pool.end();
})();
