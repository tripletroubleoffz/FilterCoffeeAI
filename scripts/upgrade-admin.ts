import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const updatedUser = await prisma.user.update({
      where: { email: 'tripletrouble.offz@gmail.com' },
      data: { role: 'ADMIN' }
  });
  console.log(`Successfully upgraded ${updatedUser.email} to ADMIN.`);
}

main().finally(() => prisma.$disconnect());
