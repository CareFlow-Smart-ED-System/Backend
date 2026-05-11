require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const argon2 = require('argon2');
const { randomUUID } = require('crypto');

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  try {
    const passwordHash = await argon2.hash('AdminPass123!');
    
    const admin = await prisma.user.upsert({
      where: { email: 'admin@careflow.com' },
      update: {},
      create: {
        id: randomUUID(),
        email: 'admin@careflow.com',
        displayName: 'Admin User',
        passwordHash: passwordHash,
        role: 'ADMIN',
      },
    });

    console.log('✅ Admin user created/verified:');
    console.log(`   Email: ${admin.email}`);
    console.log(`   Role: ${admin.role}`);
    console.log(`   ID: ${admin.id}`);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
