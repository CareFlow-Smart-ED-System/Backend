const { Pool } = require('pg');
const argon2 = require('argon2');
(async () => {
  const pool = new Pool({ user: 'postgres', host: '127.0.0.1', database: 'ed_system', port: 5432 });
  const email = 'sara.ahmed.4eff7bb2@careflow.com';
  const password = 'DoctorPass123!';
  const hash = await argon2.hash(password);
  await pool.query('UPDATE "User" SET "passwordHash" = $1, "failedLoginAttempts" = 0, "lockedUntil" = NULL WHERE email = $2', [hash, email]);
  console.log(JSON.stringify({ email, password }, null, 2));
  await pool.end();
})();
