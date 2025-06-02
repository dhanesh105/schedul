import { Controller, Get, Post, Body, Param, Put, Delete, Query } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

// Mock data
const mockAppointments = [
  {
    id: '1',
    doctorId: '1',
    patientId: '1',
    date: '2023-06-15',
    startTime: '09:00',
    endTime: '09:30',
    status: 'CONFIRMED',
    reason: 'Annual checkup',
    notes: 'Patient has reported chest pain',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    doctorId: '2',
    patientId: '2',
    date: '2023-06-16',
    startTime: '10:00',
    endTime: '10:30',
    status: 'SCHEDULED',
    reason: 'Flu symptoms',
    notes: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

@Controller('api/appointments')
export class AppointmentController {
  @Get()
  findAll(@Query('status') status?: string, @Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
    let filteredAppointments = [...mockAppointments];

    if (status) {
      filteredAppointments = filteredAppointments.filter(a => a.status === status);
    }

    if (startDate) {
      filteredAppointments = filteredAppointments.filter(a => a.date >= startDate);
    }

    if (endDate) {
      filteredAppointments = filteredAppointments.filter(a => a.date <= endDate);
    }

    return filteredAppointments;
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    const appointment = mockAppointments.find(a => a.id === id);
    if (!appointment) {
      return { error: 'Appointment not found' };
    }
    return appointment;
  }

  @Post()
  create(@Body() createAppointmentDto: any) {
    console.log('📝 Backend received appointment data:', createAppointmentDto);

    const newAppointment = {
      // Use the ID from frontend if provided, otherwise generate new one
      id: createAppointmentDto.id || uuidv4(),
      ...createAppointmentDto,
      status: createAppointmentDto.status || 'SCHEDULED', // Automatically schedule appointments
      createdAt: createAppointmentDto.createdAt || new Date().toISOString(),
      updatedAt: createAppointmentDto.updatedAt || new Date().toISOString(),
    };

    console.log('✅ Backend created appointment (auto-scheduled):', newAppointment);
    mockAppointments.push(newAppointment);

    console.log('📊 Total appointments in backend:', mockAppointments.length);
    console.log('🔍 All backend appointments:', mockAppointments);

    // TODO: Send notification to doctor about new appointment
    console.log(`📧 Notification: New appointment scheduled for Doctor ID ${newAppointment.doctorId} on ${newAppointment.date} at ${newAppointment.startTime}`);

    return newAppointment;
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateAppointmentDto: any) {
    const index = mockAppointments.findIndex(a => a.id === id);
    if (index === -1) {
      return { error: 'Appointment not found' };
    }

    const updatedAppointment = {
      ...mockAppointments[index],
      ...updateAppointmentDto,
      updatedAt: new Date().toISOString(),
    };

    mockAppointments[index] = updatedAppointment;
    return updatedAppointment;
  }

  @Put(':id/cancel')
  cancel(@Param('id') id: string) {
    console.log('📝 Backend cancel appointment request for ID:', id);
    const index = mockAppointments.findIndex(a => a.id === id);
    if (index === -1) {
      console.log('❌ Appointment not found for cancellation:', id);
      return { error: 'Appointment not found' };
    }

    mockAppointments[index].status = 'CANCELLED';
    mockAppointments[index].updatedAt = new Date().toISOString();

    console.log('✅ Appointment cancelled:', mockAppointments[index]);
    return mockAppointments[index];
  }

  @Put(':id/confirm')
  confirm(@Param('id') id: string) {
    console.log('📝 Backend confirm appointment request for ID:', id);
    const index = mockAppointments.findIndex(a => a.id === id);
    if (index === -1) {
      console.log('❌ Appointment not found for confirmation:', id);
      return { error: 'Appointment not found' };
    }

    mockAppointments[index].status = 'CONFIRMED';
    mockAppointments[index].updatedAt = new Date().toISOString();

    console.log('✅ Appointment confirmed:', mockAppointments[index]);
    return mockAppointments[index];
  }

  @Put(':id/reject')
  reject(@Param('id') id: string, @Body() body: { reason?: string }) {
    console.log('📝 Backend reject appointment request for ID:', id, 'Reason:', body.reason);
    const index = mockAppointments.findIndex(a => a.id === id);
    if (index === -1) {
      console.log('❌ Appointment not found for rejection:', id);
      return { error: 'Appointment not found' };
    }

    mockAppointments[index].status = 'CANCELLED';
    mockAppointments[index].notes = body.reason ? `Rejected: ${body.reason}` : 'Rejected by doctor';
    mockAppointments[index].updatedAt = new Date().toISOString();

    console.log('✅ Appointment rejected:', mockAppointments[index]);
    return mockAppointments[index];
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    const index = mockAppointments.findIndex(a => a.id === id);
    if (index === -1) {
      return { error: 'Appointment not found' };
    }

    const removedAppointment = mockAppointments.splice(index, 1)[0];
    return { message: 'Appointment removed successfully', appointment: removedAppointment };
  }

  @Get('doctor/:doctorId')
  findByDoctor(@Param('doctorId') doctorId: string, @Query('status') status?: string, @Query('date') date?: string) {
    let filteredAppointments = mockAppointments.filter(a => a.doctorId === doctorId);

    if (status) {
      filteredAppointments = filteredAppointments.filter(a => a.status === status);
    }

    if (date) {
      filteredAppointments = filteredAppointments.filter(a => a.date === date);
    }

    return filteredAppointments;
  }

  @Get('patient/:patientId')
  findByPatient(@Param('patientId') patientId: string, @Query('status') status?: string) {
    let filteredAppointments = mockAppointments.filter(a => a.patientId === patientId);

    if (status) {
      filteredAppointments = filteredAppointments.filter(a => a.status === status);
    }

    return filteredAppointments;
  }

  @Get('me')
  findMine() {
    // In a real app, we would get the user ID from the JWT token
    // For now, just return all appointments
    return mockAppointments;
  }
}
