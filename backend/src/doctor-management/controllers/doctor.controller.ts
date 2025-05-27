import { Controller, Get, Post, Body, Param, Put, Delete } from '@nestjs/common';
import { DoctorService } from '../services/doctor.service';
import { CreateDoctorDto } from '../dto/create-doctor.dto';
import { UpdateDoctorDto } from '../dto/update-doctor.dto';

@Controller('api/doctors')
export class DoctorController {
  constructor(private readonly doctorService: DoctorService) {}

  @Get()
  async findAll() {
    return this.doctorService.findAll();
  }

  @Get('me')
  async getMyProfile() {
    // For now, return the first doctor in the database
    // In a real app, this would get the current user from JWT token
    // and find their associated doctor profile
    const doctors = await this.doctorService.findAll();
    if (doctors.length > 0) {
      return doctors[0];
    }
    throw new Error('No doctor profile found');
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.doctorService.findOne(id);
  }

  @Post()
  async create(@Body() createDoctorDto: CreateDoctorDto) {
    return this.doctorService.create(createDoctorDto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateDoctorDto: UpdateDoctorDto) {
    return this.doctorService.update(id, updateDoctorDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    await this.doctorService.remove(id);
    return { message: 'Doctor removed successfully' };
  }
}
