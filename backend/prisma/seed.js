import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../lib/auth.js';

const prisma = new PrismaClient();

async function main() {
  const email = 'user10@gmail.com';
  const name = 'user';
  const passwordPlain = 'password123';

  const hashedPassword = await hashPassword(passwordPlain);

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email }
  });

  if (!existingUser) {
    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
        role: {
          connect: { name: 'student' } // assuming default role named 'student'
        }
      }
    });
    console.log('Sample user created:', user.email);
  } else {
    console.log('Sample user already exists:', existingUser.email);
  }
}

main()
  .catch(e => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
