import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppointmentController } from './controllers/appointment.controller';
import { ScheduleController } from './controllers/schedule.controller';
import { Appointment } from './entities/appointment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Appointment])],
  controllers: [AppointmentController, ScheduleController],
  providers: [],
  exports: [],
})
export class ScheduleManagementModule {}
