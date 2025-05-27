import { Controller, Post, Body, Get, UseGuards, Request } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDoctorDto } from './dto/register-doctor.dto';
import { RegisterPatientDto } from './dto/register-patient.dto';
import { LoginDto } from './dto/login.dto';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register/doctor')
  async registerDoctor(@Body() registerDoctorDto: RegisterDoctorDto) {
    console.log('Doctor registration request received:', registerDoctorDto);
    try {
      const result = await this.authService.registerDoctor(registerDoctorDto);
      console.log('Doctor registration successful:', result);
      return result;
    } catch (error) {
      console.error('Doctor registration error:', error);
      throw error;
    }
  }

  @Post('register/patient')
  async registerPatient(@Body() registerPatientDto: RegisterPatientDto) {
    return this.authService.registerPatient(registerPatientDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Get('me')
  async getCurrentUser(@Request() req) {
    // This will be implemented with JWT authentication later
    return { message: 'Current user endpoint' };
  }
}
