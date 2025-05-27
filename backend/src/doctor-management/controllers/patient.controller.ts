import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

// Mock data
const mockPatients = [
  {
    id: '1',
    userId: 'user-3',
    firstName: 'Alice',
    lastName: 'Johnson',
    gender: 'FEMALE',
    email: 'alice.johnson@example.com',
    phone: '555-123-4567',
    dateOfBirth: '1985-07-15',
    address: '123 Main St, Anytown, USA',
    medicalHistory: 'Allergic to penicillin',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    userId: 'user-4',
    firstName: 'Bob',
    lastName: 'Williams',
    gender: 'MALE',
    email: 'bob.williams@example.com',
    phone: '555-987-6543',
    dateOfBirth: '1990-03-22',
    address: '456 Oak Ave, Somewhere, USA',
    medicalHistory: 'No known allergies',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

@Controller('api/patients')
export class PatientController {
  @Get()
  findAll() {
    return mockPatients;
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    const patient = mockPatients.find(p => p.id === id);
    if (!patient) {
      return { error: 'Patient not found' };
    }
    return patient;
  }

  @Post()
  create(@Body() createPatientDto: any) {
    const newPatient = {
      id: uuidv4(),
      ...createPatientDto,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockPatients.push(newPatient);
    return newPatient;
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updatePatientDto: any) {
    const index = mockPatients.findIndex(p => p.id === id);
    if (index === -1) {
      return { error: 'Patient not found' };
    }

    const updatedPatient = {
      ...mockPatients[index],
      ...updatePatientDto,
      updatedAt: new Date().toISOString(),
    };

    mockPatients[index] = updatedPatient;
    return updatedPatient;
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    const index = mockPatients.findIndex(p => p.id === id);
    if (index === -1) {
      return { error: 'Patient not found' };
    }

    const removedPatient = mockPatients.splice(index, 1)[0];
    return { message: 'Patient removed successfully', patient: removedPatient };
  }
}
