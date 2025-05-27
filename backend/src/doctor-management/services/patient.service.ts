import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Patient } from '../entities/patient.entity';
import { CreatePatientDto } from '../dto/create-patient.dto';
import { UpdatePatientDto } from '../dto/update-patient.dto';
import { AuthService } from '../../auth/auth.service';

@Injectable()
export class PatientService {
  constructor(
    @InjectRepository(Patient)
    private patientRepository: Repository<Patient>,
    private authService: AuthService,
  ) {}

  async findAll(): Promise<Patient[]> {
    return this.patientRepository.find();
  }

  async findOne(id: string): Promise<Patient> {
    const patient = await this.patientRepository.findOne({ where: { id } });
    if (!patient) {
      throw new NotFoundException(`Patient with ID ${id} not found`);
    }
    return patient;
  }

  async findByUserId(userId: string): Promise<Patient> {
    const patient = await this.patientRepository.findOne({ where: { userId } });
    if (!patient) {
      throw new NotFoundException(`Patient with user ID ${userId} not found`);
    }
    return patient;
  }

  async create(createPatientDto: CreatePatientDto): Promise<Patient> {
    // Check if patient with same email already exists
    const existingPatient = await this.patientRepository.findOne({
      where: { email: createPatientDto.email },
    });

    if (existingPatient) {
      throw new ConflictException('Patient with this email already exists');
    }

    const patient = this.patientRepository.create(createPatientDto);
    return this.patientRepository.save(patient);
  }

  async update(id: string, updatePatientDto: UpdatePatientDto): Promise<Patient> {
    const patient = await this.findOne(id);
    
    // Check if email is being updated and if it's already in use
    if (updatePatientDto.email && updatePatientDto.email !== patient.email) {
      const existingPatient = await this.patientRepository.findOne({
        where: { email: updatePatientDto.email },
      });
      
      if (existingPatient && existingPatient.id !== id) {
        throw new ConflictException('Email already in use');
      }
    }
    
    Object.assign(patient, updatePatientDto);
    return this.patientRepository.save(patient);
  }

  async remove(id: string): Promise<void> {
    const patient = await this.findOne(id);
    await this.patientRepository.remove(patient);
  }
}
