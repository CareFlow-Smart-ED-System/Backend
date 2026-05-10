const { Pool } = require('pg');
(async () => {
  const pool = new Pool({ user: 'postgres', host: '127.0.0.1', database: 'ed_system', port: 5432 });
  const caseId = 'e35dc201-4c89-4694-92f4-f98a32e389a1';
  const result = await pool.query('SELECT id, "caseId", "doctorId", role, "assignedAt" FROM "CaseDoctor" WHERE "caseId" = $1 ORDER BY "assignedAt" DESC', [caseId]);
  console.log(JSON.stringify(result.rows, null, 2));
  await pool.end();
})();
