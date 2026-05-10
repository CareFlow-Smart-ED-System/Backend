const { Pool } = require('pg');
(async () => {
  const pool = new Pool({ user: 'postgres', host: '127.0.0.1', database: 'ed_system', port: 5432 });
  const email = 'newadmin@careflow.com';
  const result = await pool.query('SELECT u.id as user_id, u.email, u.role, d.id as doctor_id, d."userId" as doctor_user_id FROM "User" u LEFT JOIN "Doctor" d ON d."userId" = u.id WHERE u.email = $1', [email]);
  console.log(JSON.stringify(result.rows, null, 2));
  await pool.end();
})();
