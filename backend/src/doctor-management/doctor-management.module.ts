import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { DoctorController } from './controllers/doctor.controller';
import { PatientController } from './controllers/patient.controller';
import { DoctorService } from './services/doctor.service';
import { PatientService } from './services/patient.service';
import { Doctor } from './entities/doctor.entity';
import { Patient } from './entities/patient.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Doctor, Patient]),
    AuthModule,
  ],
  controllers: [DoctorController, PatientController],
  providers: [DoctorService, PatientService],
  exports: [DoctorService, PatientService],
})
export class DoctorManagementModule {}
