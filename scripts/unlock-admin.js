const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: '127.0.0.1',
  database: 'ed_system',
  port: 5432,
});

pool
  .query(
    'UPDATE "User" SET "failedLoginAttempts"=0, "lockedUntil"=NULL WHERE email=$1',
    ['admin@careflow.com']
  )
  .then((result) => {
    console.log('✅ Admin account unlocked');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Failed to unlock admin:', error);
    process.exit(1);
  });
