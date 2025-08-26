const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // Create test user
  const testUser = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      name: 'Test User',
      passwordHash: 'hashed_password',
      passwordSalt: 'salt',
      role: 'USER',
      isActive: true,
      isVerified: true,
    },
  });

  console.log('Created test user:', testUser);

  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      passwordHash: 'hashed_password',
      passwordSalt: 'salt',
      role: 'ADMIN',
      isActive: true,
      isVerified: true,
    },
  });

  console.log('Created admin user:', adminUser);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });