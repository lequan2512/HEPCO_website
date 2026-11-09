const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const categories = [
    { id: 1, name: 'PC', is_component: false, description: 'Máy tính để bàn' },
    { id: 2, name: 'Laptop', is_component: false, description: 'Máy tính xách tay' },
    { id: 3, name: 'Máy POS', is_component: false, description: 'Máy bán hàng POS' },
    { id: 4, name: 'Màn hình', is_component: false, description: 'Màn hình máy tính' },
    { id: 5, name: 'RAM', is_component: true, description: 'Bộ nhớ trong' },
    { id: 6, name: 'Ổ cứng', is_component: true, description: 'Lưu trữ HDD/SSD' },
  ];

  for (const cat of categories) {
    await prisma.deviceCategory.upsert({
      where: { id: cat.id },
      update: {},
      create: cat,
    });
  }
  console.log('Categories seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
