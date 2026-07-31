import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './modules/auth/entities/user.entity';

async function seedDatabase() {
  const app = await NestFactory.create(AppModule);
  const dataSource = app.get(DataSource);
  
  try {
    console.log('🌱 Seeding database...');

    const userRepository = dataSource.getRepository(User);

    // Password: password123 (hashed with bcrypt round 10)
    const hashedPassword = await bcrypt.hash('password123', 10);

    // Define test users
    const testUsers = [
      {
        id: 1,
        name: 'Admin LAM Teknik',
        email: 'admin@lamtek.ac.id',
        role: 'ADMIN',
        password: hashedPassword,
      },
      {
        id: 2,
        name: 'Demo User',
        email: 'demo@test.com',
        role: 'PRODI',
        password: hashedPassword,
      },
      {
        id: 3,
        name: 'Validator User',
        email: 'validator@test.com',
        role: 'VALIDATOR',
        password: hashedPassword,
      },
      {
        id: 4,
        name: 'Institution User',
        email: 'institution@test.com',
        role: 'KOMITE_EVALUASI',
        password: hashedPassword,
      },
    ];

    for (const userData of testUsers) {
      const existing = await userRepository.findOne({
        where: { email: userData.email },
      });

      if (!existing) {
        const user = userRepository.create(userData);
        await userRepository.save(user);
        console.log(`✅ Created user: ${userData.email} (${userData.role})`);
      } else {
        // Update existing user with correct data
        existing.name = userData.name;
        existing.role = userData.role as any;
        existing.password = hashedPassword;
        await userRepository.save(existing);
        console.log(`✏️  Updated user: ${userData.email} (${userData.role})`);
      }
    }

    console.log('\n📋 Test Users Created/Updated:');
    console.log('================================');
    testUsers.forEach((user) => {
      console.log(`\n📧 ${user.email}`);
      console.log(`   Name: ${user.name}`);
      console.log(`   Role: ${user.role}`);
      console.log(`   Password: password123`);
    });

    console.log('\n🌐 Login at: http://localhost:3000/login');
    console.log('✨ Database seeding completed!');
  } catch (error) {
    console.error('❌ Error seeding database:', error);
  } finally {
    await app.close();
  }
}

seedDatabase();
