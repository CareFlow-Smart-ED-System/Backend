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

    const newEmail = 'newadmin@careflow.com';
    const newPassword = 'NewAdminPass123!';
    const passwordHash = await argon2.hash(newPassword);
    const adminId = 'admin-' + Date.now();
    const now = new Date().toISOString();

    // Delete old account first
    await pool.query('DELETE FROM "User" WHERE email = $1', [newEmail]);
    console.log('Deleted existing account if any');

    // Create new admin
    const query = `
      INSERT INTO "User" (id, email, "passwordHash", "displayName", role, "createdAt", "updatedAt", "mustChangePassword", "failedLoginAttempts")
      VALUES ($1, $2, $3, $4, $5, $6, $7, false, 0)
      RETURNING id, email;
    `;

    const result = await pool.query(query, [
      adminId,
      newEmail,
      passwordHash,
      'New System Admin',
      'ADMIN',
      now,
      now,
    ]);

    console.log('\n✅ New admin created:');
    console.log(`📧 Email: ${result.rows[0].email}`);
    console.log(`🔐 Password: ${newPassword}`);
    console.log(`🆔 ID: ${result.rows[0].id}`);

    await pool.end();
  } catch (error) {
    console.error('❌ Failed:', error);
    process.exit(1);
  }
}

main();
