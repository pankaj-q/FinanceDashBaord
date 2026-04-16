import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const categories = {
  INCOME: ['SALARY', 'INVESTMENT', 'FREELANCE', 'OTHER_INCOME'],
  EXPENSE: ['FOOD', 'TRANSPORT', 'UTILITIES', 'ENTERTAINMENT', 'HEALTHCARE', 'EDUCATION', 'SHOPPING', 'HOUSING', 'INSURANCE', 'OTHER_EXPENSE'],
};

async function main() {
  console.log('🌱 Seeding database...');

  await prisma.record.deleteMany();
  await prisma.user.deleteMany();

  const adminPassword = await bcrypt.hash('Admin@123456', 10);
  const analystPassword = await bcrypt.hash('Analyst@123', 10);
  const viewerPassword = await bcrypt.hash('Viewer@123', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@finance.com',
      password: adminPassword,
      name: 'Admin User',
      role: 'ADMIN',
      status: 'ACTIVE',
    },
  });

  const analyst = await prisma.user.create({
    data: {
      email: 'analyst@finance.com',
      password: analystPassword,
      name: 'Analyst User',
      role: 'ANALYST',
      status: 'ACTIVE',
    },
  });

  const viewer = await prisma.user.create({
    data: {
      email: 'viewer@finance.com',
      password: viewerPassword,
      name: 'Viewer User',
      role: 'VIEWER',
      status: 'ACTIVE',
    },
  });

  console.log('✅ Created users');

  const now = new Date();
  const records = [];

  for (let i = 0; i < 50; i++) {
    const isIncome = Math.random() > 0.6;
    const type = isIncome ? 'INCOME' : 'EXPENSE';
    const categoryList = isIncome ? categories.INCOME : categories.EXPENSE;
    const category = categoryList[Math.floor(Math.random() * categoryList.length)];
    
    const daysAgo = Math.floor(Math.random() * 90);
    const date = new Date(now);
    date.setDate(date.getDate() - daysAgo);

    const user = [admin, analyst][Math.floor(Math.random() * 2)];

    records.push({
      amount: Math.floor(Math.random() * 5000) + 100,
      type,
      category,
      date,
      description: `${type === 'INCOME' ? 'Received' : 'Paid'} for ${category.toLowerCase().replace('_', ' ')}`,
      notes: i % 5 === 0 ? `Transaction note #${i}` : null,
      userId: user.id,
    });
  }

  await prisma.record.createMany({ data: records });

  console.log('✅ Created 50 financial records');
  console.log('\n📋 Login Credentials:');
  console.log('─────────────────────────────────────');
  console.log('Admin:   admin@finance.com / admin123');
  console.log('Analyst: analyst@finance.com / analyst123');
  console.log('Viewer:  viewer@finance.com / viewer123');
  console.log('─────────────────────────────────────\n');

  console.log('🎉 Database seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
