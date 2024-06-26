import { hash } from '@node-rs/argon2';
import { PrismaClient, RoleType } from '@prisma/client';

const prisma = new PrismaClient();

async function seedUsers() {
  const exists = await prisma.user.findMany({
    take: 1,
  });

  if (exists.length === 0) {
    await prisma.user.create({
      data: {
        name: 'Admin',
        address: 'Swastik College',
        contact: '9841234567',
        email: 'admin@swastikcollege.edu.np',
        password: await hash('admin1234'),
        role: RoleType.ADMIN,
      },
    });
  }
}

async function seedSemester() {
  const exists = await prisma.semester.count();

  if (!exists) {
    await prisma.semester.createMany({
      data: Array.from(
        {
          length: 8,
        },
        (_, i) => ({
          name: `Semester ${i + 1}`,
        }),
      ),
      skipDuplicates: true,
    });
  }
}

async function main() {
  await seedUsers();
  await seedSemester();
}

main();
