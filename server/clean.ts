import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function clean() {
  const result = await prisma.project.deleteMany({
    where: { name: 'Default Project' }
  });
  console.log(`Deleted ${result.count} Default Projects`);
}

clean().finally(() => prisma.$disconnect());
