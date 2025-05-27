import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User } from './entities/user.entity';
import { Doctor } from '../doctor-management/entities/doctor.entity';
import { Patient } from '../doctor-management/entities/patient.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Doctor, Patient])],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
