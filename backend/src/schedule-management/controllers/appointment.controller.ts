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
    const newAppointment = {
      id: uuidv4(),
      ...createAppointmentDto,
      status: 'SCHEDULED',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockAppointments.push(newAppointment);
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
    const index = mockAppointments.findIndex(a => a.id === id);
    if (index === -1) {
      return { error: 'Appointment not found' };
    }
    
    mockAppointments[index].status = 'CANCELLED';
    mockAppointments[index].updatedAt = new Date().toISOString();
    
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
