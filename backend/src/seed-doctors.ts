import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DoctorService } from './doctor-management/services/doctor.service';
import { AuthService } from './auth/auth.service';
import { Gender } from './doctor-management/entities/doctor.entity';

async function seedDoctors() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const doctorService = app.get(DoctorService);
  const authService = app.get(AuthService);

  try {
    // Register doctors using the auth service
    const doctor1 = await authService.registerDoctor({
      email: 'john.doe@example.com',
      password: 'password123',
      firstName: 'John',
      lastName: 'Doe',
      gender: Gender.MALE,
      phone: '123-456-7890',
      registrationNumber: 'MED12345',
      profileImageUrl: ''
    });

    const doctor2 = await authService.registerDoctor({
      email: 'jane.smith@example.com',
      password: 'password123',
      firstName: 'Jane',
      lastName: 'Smith',
      gender: Gender.FEMALE,
      phone: '987-654-3210',
      registrationNumber: 'MED67890',
      profileImageUrl: ''
    });

    const doctor3 = await authService.registerDoctor({
      email: 'michael.johnson@example.com',
      password: 'password123',
      firstName: 'Michael',
      lastName: 'Johnson',
      gender: Gender.MALE,
      phone: '555-123-4567',
      registrationNumber: 'MED54321',
      profileImageUrl: ''
    });

    console.log('Doctors seeded successfully:');
    console.log('Doctor 1:', doctor1);
    console.log('Doctor 2:', doctor2);
    console.log('Doctor 3:', doctor3);

  } catch (error) {
    console.error('Error seeding doctors:', error);
  } finally {
    await app.close();
  }
}

seedDoctors();
