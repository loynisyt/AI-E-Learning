// lib/user.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getUserByFirebaseUidOrCreate(uid, email, name) {
  let user = await prisma.user.findUnique({ where: { firebaseUid: uid }});
  if (!user) {
    user = await prisma.user.create({ data: { email, name, firebaseUid: uid, provider:'firebase' }});
  }
  return user;
}
async function getUserById(id) {
  return prisma.user.findUnique({ where: { id }});
}
module.exports = { getUserByFirebaseUidOrCreate, getUserById };
