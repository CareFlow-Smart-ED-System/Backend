require('dotenv').config();

const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient, UserRole } = require('@prisma/client');
const argon2 = require('argon2');

async function main() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error('DATABASE_URL is not set');
  }

  const prisma = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
  });

  const email = 'admin@careflow.com';
  const password = 'AdminPass123!';
  const passwordHash = await argon2.hash(password);

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      displayName: 'Admin User',
      role: UserRole.ADMIN,
      passwordHash,
      mustChangePassword: false,
      lockedUntil: null,
      failedLoginAttempts: 0,
    },
    create: {
      email,
      displayName: 'Admin User',
      role: UserRole.ADMIN,
      passwordHash,
      mustChangePassword: false,
    },
    select: {
      id: true,
      email: true,
      displayName: true,
      role: true,
      mustChangePassword: true,
    },
  });

  console.log(JSON.stringify(user, null, 2));
  await prisma.$disconnect();
}

main().catch(async (error) => {
  console.error(error);
  process.exitCode = 1;
});
