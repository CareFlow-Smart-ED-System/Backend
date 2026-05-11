import * as argon2 from 'argon2';
import * as dotenv from 'dotenv';
import { Pool } from 'pg';

// Load environment variables
dotenv.config({ path: '.env' });

async function main() {
  const DATABASE_URL = process.env.DATABASE_URL;

  if (!DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  const pool = new Pool({
    connectionString: DATABASE_URL,
  });

  try {
    console.log('🌱 Starting database seed...');

    // Hash the password
    const passwordHash = await argon2.hash('AdminPass123!');
    const now = new Date().toISOString();
    const adminId = 'admin-' + Date.now();

    // Check if admin already exists
    const checkQuery = 'SELECT id, email FROM "User" WHERE email = $1';
    const checkResult = await pool.query(checkQuery, ['admin@careflow.com']);

    if (checkResult.rows.length > 0) {
      console.log('✓ Admin user already exists');
      console.log(`  Email: ${checkResult.rows[0].email}`);
      console.log(`  ID: ${checkResult.rows[0].id}`);
      return;
    }

    // Insert admin user
    const insertQuery = `
      INSERT INTO "User" (id, email, "passwordHash", "displayName", role, "createdAt", "updatedAt", "mustChangePassword", "failedLoginAttempts")
      VALUES ($1, $2, $3, $4, $5, $6, $7, false, 0)
      RETURNING id, email, "displayName", role
    `;

    const result = await pool.query(insertQuery, [
      adminId,
      'admin@careflow.com',
      passwordHash,
      'System Administrator',
      'ADMIN',
      now,
      now,
    ]);

    if (result.rows.length > 0) {
      const admin = result.rows[0];
      console.log('✅ Admin user created successfully:');
      console.log(`   Email: ${admin.email}`);
      console.log(`   Display Name: ${admin.displayName}`);
      console.log(`   Role: ${admin.role}`);
      console.log(`   ID: ${admin.id}`);
      console.log('\n📋 Credentials for testing:');
      console.log('   Email: admin@careflow.com');
      console.log('   Password: AdminPass123!');
    }
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

main();
