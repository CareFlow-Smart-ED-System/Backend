const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: '127.0.0.1',
  database: 'ed_system',
  port: 5432,
});

pool
  .query('SELECT id, email, "displayName", role, "passwordHash" FROM "User" WHERE email = $1', [
    'admin@careflow.com',
  ])
  .then((result) => {
    if (result.rows.length === 0) {
      console.log('❌ Admin account not found');
    } else {
      const admin = result.rows[0];
      console.log('✅ Admin account found:');
      console.log('ID:', admin.id);
      console.log('Email:', admin.email);
      console.log('Display Name:', admin.displayName);
      console.log('Role:', admin.role);
      console.log('Password Hash:', admin.passwordHash);
    }
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error.message);
    process.exit(1);
  });
