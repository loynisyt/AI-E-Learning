// prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const { createDirectusAdmin } = require('../lib/directusAdmin');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Seed Prisma admin user
  console.log('Creating Prisma admin user...');
  const hashedPassword = await bcrypt.hash('Loynis2020@', 10);

  const adminUser = await prisma.user.upsert({
    where: {
      email: 'admin@example.com'
    },
    update: {
      name: 'Administrator',
      password: hashedPassword,
      provider: 'credentials'
    },
    create: {
      email: 'admin@example.com',
      name: 'Administrator',
      password: hashedPassword,
      provider: 'credentials'
    }
  });

  console.log('Prisma admin user created/updated:', adminUser.email);

  // Seed Directus admin user (optional)
  if (process.env.NEXT_PUBLIC_DIRECTUS_URL) {
    console.log('Creating Directus admin user...');
    await createDirectusAdmin('admin@example.com', 'Loynis2020@');
  } else {
    console.log('Directus URL not configured, skipping Directus admin creation');
  }

  console.log('Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
