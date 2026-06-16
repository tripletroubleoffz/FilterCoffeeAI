import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({ select: { email: true, role: true } });
  console.log(JSON.stringify(users, null, 2));

  // If there are no users, let's create a default admin user
  if (users.length === 0) {
    console.log("No users found. You can create one by signing up.");
  } else {
    // Check if there is an admin
    const admin = users.find(u => u.role === 'ADMIN');
    if (!admin) {
        // Upgrade the first user to admin
        const updatedUser = await prisma.user.update({
            where: { email: users[0].email },
            data: { role: 'ADMIN' }
        });
        console.log(`Upgraded ${updatedUser.email} to ADMIN.`);
    }
  }
}

main().finally(() => prisma.$disconnect());
