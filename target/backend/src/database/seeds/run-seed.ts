import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../../modules/auth/entities/user.entity';

const TEST_USERS = [
  {
    name: 'Admin LAM Teknik',
    email: 'admin@lamtek.ac.id',
    password: 'password123',
    role: 'ADMIN',
    tenantId: null,
  },
  {
    name: 'Test User',
    email: 'demo@test.com',
    password: 'admin123',
    role: 'USER',
    tenantId: null,
  },
  {
    name: 'Validator Asesmen',
    email: 'validator@test.com',
    password: 'validator123',
    role: 'VALIDATOR',
    tenantId: null,
  },
  {
    name: 'Institution Admin',
    email: 'institution@test.com',
    password: 'institution123',
    role: 'INSTITUTION',
    tenantId: null,
  },
];

async function seedDatabase() {
  const app = await NestFactory.create(AppModule);
  const dataSource = app.get(DataSource);

  try {
    console.log('\n🌱 Starting database seeding...\n');

    const userRepository = dataSource.getRepository(User);

    for (const testUser of TEST_USERS) {
      const existingUser = await userRepository.findOne({
        where: { email: testUser.email },
      });

      if (existingUser) {
        console.log(`✅ User already exists: ${testUser.email}`);
      } else {
        const hashedPassword = await bcrypt.hash(testUser.password, 10);
        const user = userRepository.create({
          ...testUser,
          nama: testUser.name,
          password: hashedPassword,
        });
        await userRepository.save(user);
        console.log(`✅ Created user: ${testUser.email} (Password: ${testUser.password})`);
      }
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📋 AVAILABLE TEST ACCOUNTS FOR LOGIN');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    TEST_USERS.forEach((user) => {
      console.log(`\n📧 Email:    ${user.email}`);
      console.log(`🔐 Password: ${user.password}`);
      console.log(`👤 Role:     ${user.role}`);
    });
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n🌐 Access the application at:');
    console.log('   Login:     http://localhost:3002/login');
    console.log('   Dashboard: http://localhost:3002/dashboard');
    console.log('   API Docs:  http://localhost:3003/api/docs');
    console.log('   Swagger:   http://localhost:3003/api/docs\n');
    console.log('✨ Database seeding completed!\n');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    await app.close();
  }
}

seedDatabase();
