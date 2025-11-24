
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcrypt';
// import { products } from '../src/data/products';

const prisma = new PrismaClient();

async function main() {
  // console.log('Seeding products...');
  // for (const product of products) {
  //   await prisma.product.upsert({
  //     where: { code: product.code },
  //     update: {
  //       name: product.name,
  //       brand: product.brand,
  //       category: product.category,
  //       model: product.model,
  //       imageUrl: product.imageUrl,
  //       inStock: product.inStock,
  //       restockDate: product.restockDate ? new Date(product.restockDate) : null,
  //       price: product.price,
  //       description: product.description,
  //       tags: product.tags || [],
  //       popularity: product.popularity || 0,
  //     },
  //     create: {
  //       code: product.code,
  //       name: product.name,
  //       brand: product.brand,
  //       category: product.category,
  //       model: product.model,
  //       imageUrl: product.imageUrl,
  //       inStock: product.inStock,
  //       restockDate: product.restockDate ? new Date(product.restockDate) : null,
  //       price: product.price,
  //       description: product.description,
  //       tags: product.tags || [],
  //       popularity: product.popularity || 0,
  //     },
  //   });
  // }
  // console.log('Products seeded successfully.');

  console.log('Seeding admin user...');
  const hashedPassword = await hash('admin123', 10);
  
  await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      name: 'Admin User',
      email: 'admin@example.com',
      hashedPassword,
      role: 'ADMIN',
      approved: true,
    },
  });
  console.log('Admin user seeded successfully.');

  console.log('Products seeded successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
