// lib/user.js
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function getUserByFirebaseUidOrCreate(uid, email, name) {
  let user = await prisma.user.findUnique({ where: { firebaseUid: uid }});
  if (!user) {
    user = await prisma.user.create({ data: { email, name, firebaseUid: uid, provider:'firebase' }});
  }
  return user;
}

export async function getUserById(id) {
  return prisma.user.findUnique({ where: { id }});
}
