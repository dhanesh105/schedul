import { Injectable, ConflictException, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { RegisterDoctorDto } from './dto/register-doctor.dto';
import { RegisterPatientDto } from './dto/register-patient.dto';
import { LoginDto } from './dto/login.dto';
import { User, UserRole } from './entities/user.entity';
import { Doctor, Gender } from '../doctor-management/entities/doctor.entity';
import { Patient } from '../doctor-management/entities/patient.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Doctor)
    private doctorRepository: Repository<Doctor>,
    @InjectRepository(Patient)
    private patientRepository: Repository<Patient>,
  ) {}

  async registerDoctor(registerDoctorDto: RegisterDoctorDto) {
    const { email, password, firstName, lastName, gender, phone, registrationNumber } = registerDoctorDto;

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Check if doctor with same registration number exists
    const existingDoctor = await this.doctorRepository.findOne({
      where: { registrationNumber }
    });
    if (existingDoctor) {
      throw new ConflictException('Registration number already exists');
    }

    // Create new user
    const user = this.userRepository.create({
      email,
      password, // In production, hash this password
      role: UserRole.DOCTOR,
    });
    const savedUser = await this.userRepository.save(user);

    // Create doctor profile
    const doctor = this.doctorRepository.create({
      userId: savedUser.id,
      firstName,
      lastName,
      gender: gender as Gender,
      email,
      phone,
      registrationNumber,
    });
    await this.doctorRepository.save(doctor);

    // Remove password before returning
    const { password: _, ...userWithoutPassword } = savedUser;

    // Generate a token (in a real app, use JWT)
    const token = uuidv4();

    return {
      user: userWithoutPassword,
      token,
    };
  }

  async registerPatient(registerPatientDto: RegisterPatientDto) {
    const { email, password, firstName, lastName, gender, phone, dateOfBirth } = registerPatientDto;

    // Check if user already exists
    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Create new user
    const user = this.userRepository.create({
      email,
      password, // In production, hash this password
      role: UserRole.PATIENT,
    });
    const savedUser = await this.userRepository.save(user);

    // Create patient profile
    const patient = this.patientRepository.create({
      userId: savedUser.id,
      firstName,
      lastName,
      gender: gender as Gender,
      email,
      phone,
      dateOfBirth: new Date(dateOfBirth),
    });
    await this.patientRepository.save(patient);

    // Remove password before returning
    const { password: _, ...userWithoutPassword } = savedUser;

    // Generate a token (in a real app, use JWT)
    const token = uuidv4();

    return {
      user: userWithoutPassword,
      token,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // Find user by email
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Verify password (in a real app, we would compare hashed passwords)
    if (user.password !== password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Remove password before returning
    const { password: _, ...userWithoutPassword } = user;

    // Generate a token (in a real app, use JWT)
    const token = uuidv4();

    return {
      user: userWithoutPassword,
      token,
    };
  }

  async findUserById(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Remove password before returning
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }
}
