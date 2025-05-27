import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { DoctorManagementModule } from './doctor-management/doctor-management.module';
import { ScheduleManagementModule } from './schedule-management/schedule-management.module';
import { User } from './auth/entities/user.entity';
import { Doctor } from './doctor-management/entities/doctor.entity';
import { Patient } from './doctor-management/entities/patient.entity';
import { Appointment } from './schedule-management/entities/appointment.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5342'),
      username: process.env.DB_USERNAME || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      database: process.env.DB_NAME || 'postgres', // Connect to default postgres database first
      entities: [User, Doctor, Patient, Appointment],
      synchronize: process.env.DB_SYNC === 'true',
      logging: process.env.DB_LOGGING === 'true',
      ssl: false,
      extra: {
        trustServerCertificate: true,
        // Try different connection options
        connectionTimeoutMillis: 10000,
        idleTimeoutMillis: 30000,
      },
    }),
    AuthModule,
    DoctorManagementModule,
    ScheduleManagementModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
