import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Doctor } from '../entities/doctor.entity';
import { CreateDoctorDto } from '../dto/create-doctor.dto';
import { UpdateDoctorDto } from '../dto/update-doctor.dto';
import { AuthService } from '../../auth/auth.service';

@Injectable()
export class DoctorService {
  constructor(
    @InjectRepository(Doctor)
    private doctorRepository: Repository<Doctor>,
    private authService: AuthService,
  ) {}

  async findAll(): Promise<Doctor[]> {
    console.log('DoctorService.findAll() called');
    const doctors = await this.doctorRepository.find();
    console.log('Found doctors:', doctors.length);
    console.log('Doctors data:', doctors);
    return doctors;
  }

  async findOne(id: string): Promise<Doctor> {
    const doctor = await this.doctorRepository.findOne({ where: { id } });
    if (!doctor) {
      throw new NotFoundException(`Doctor with ID ${id} not found`);
    }
    return doctor;
  }

  async findByUserId(userId: string): Promise<Doctor> {
    const doctor = await this.doctorRepository.findOne({ where: { userId } });
    if (!doctor) {
      throw new NotFoundException(`Doctor with user ID ${userId} not found`);
    }
    return doctor;
  }

  async create(createDoctorDto: CreateDoctorDto): Promise<Doctor> {
    // Check if doctor with same email or registration number already exists
    const existingDoctor = await this.doctorRepository.findOne({
      where: [
        { email: createDoctorDto.email },
        { registrationNumber: createDoctorDto.registrationNumber },
      ],
    });

    if (existingDoctor) {
      throw new ConflictException('Doctor with this email or registration number already exists');
    }

    const doctor = this.doctorRepository.create(createDoctorDto);
    return this.doctorRepository.save(doctor);
  }

  async update(id: string, updateDoctorDto: UpdateDoctorDto): Promise<Doctor> {
    const doctor = await this.findOne(id);

    // Check if email is being updated and if it's already in use
    if (updateDoctorDto.email && updateDoctorDto.email !== doctor.email) {
      const existingDoctor = await this.doctorRepository.findOne({
        where: { email: updateDoctorDto.email },
      });

      if (existingDoctor && existingDoctor.id !== id) {
        throw new ConflictException('Email already in use');
      }
    }

    // Check if registration number is being updated and if it's already in use
    if (updateDoctorDto.registrationNumber && updateDoctorDto.registrationNumber !== doctor.registrationNumber) {
      const existingDoctor = await this.doctorRepository.findOne({
        where: { registrationNumber: updateDoctorDto.registrationNumber },
      });

      if (existingDoctor && existingDoctor.id !== id) {
        throw new ConflictException('Registration number already in use');
      }
    }

    Object.assign(doctor, updateDoctorDto);
    return this.doctorRepository.save(doctor);
  }

  async remove(id: string): Promise<void> {
    const doctor = await this.findOne(id);
    await this.doctorRepository.remove(doctor);
  }
}
