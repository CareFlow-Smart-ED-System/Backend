const { Pool } = require('pg');
(async () => {
  const pool = new Pool({ user: 'postgres', host: '127.0.0.1', database: 'ed_system', port: 5432 });
  const result = await pool.query('SELECT u.id as user_id, u.email, u.role, d.id as doctor_id, d."userId" as doctor_user_id FROM "User" u LEFT JOIN "Doctor" d ON d."userId" = u.id WHERE u.email IN ($1,$2,$3) ORDER BY u.email', ['newadmin@careflow.com','tempdoctor@careflow.com','sara.ahmed.4eff7bb2@careflow.com']);
  console.log(JSON.stringify(result.rows, null, 2));
  await pool.end();
})();
