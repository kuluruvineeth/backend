import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

async function main() {
  await prisma.application.upsert({
    where: { name: 'organizer' },
    update: {},
    create: {
      name: 'organizer',
      ApiKey: {
        create: {
          id: randomUUID(),
        },
      },
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
