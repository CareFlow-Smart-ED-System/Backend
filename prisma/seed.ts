import * as argon2 from 'argon2';
import { Pool } from 'pg';

async function main() {
  try {
    const pool = new Pool({
      user: 'postgres',
      host: '127.0.0.1',
      database: 'ed_system',
      port: 5432,
    });

    const passwordHash = await argon2.hash('AdminPass123!');
    const adminId = 'admin-' + Date.now();
    const now = new Date().toISOString();

    const query = `
      INSERT INTO "User" (id, email, "passwordHash", "displayName", role, "createdAt", "updatedAt", "mustChangePassword", "failedLoginAttempts")
      VALUES ($1, $2, $3, $4, $5, $6, $7, false, 0)
      ON CONFLICT (email) DO NOTHING
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

    if (result.rows.length > 0) {
      console.log('✅ Admin seeded:', result.rows[0].email);
    } else {
      console.log('ℹ️  Admin already exists');
    }

    await pool.end();
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

main();
