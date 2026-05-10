const { Pool } = require('pg');
const argon2 = require('argon2');

async function main() {
  try {
    const pool = new Pool({
      user: 'postgres',
      host: '127.0.0.1',
      database: 'ed_system',
      port: 5432,
    });

    // Delete existing admin if it exists
    await pool.query('DELETE FROM "User" WHERE email = $1', ['admin@careflow.com']);
    console.log('🗑️  Removed old admin account');

    // Create new admin with correct password hash (using argon2 like the app does)
    const passwordHash = await argon2.hash('AdminPass123!');
    const adminId = 'admin-' + Date.now();
    const now = new Date().toISOString();

    const query = `
      INSERT INTO "User" (id, email, "passwordHash", "displayName", role, "createdAt", "updatedAt", "mustChangePassword", "failedLoginAttempts")
      VALUES ($1, $2, $3, $4, $5, $6, $7, false, 0)
      RETURNING id, email;
    `;

    const result = await pool.query(query, [
      adminId,
      'admin@careflow.com',
      passwordHash,
      'System Admin',
      'ADMIN',
      now,
      now,
    ]);

    console.log('✅ Admin seeded with correct password:', result.rows[0].email);
    await pool.end();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
