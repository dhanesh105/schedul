import { Controller, Get, Post, Body, Param, Put, Delete, Query } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

// Mock data
const mockSchedules = [
  {
    id: '1',
    doctorId: '1',
    effectiveFrom: '2023-06-01',
    effectiveTo: '2023-12-31',
    daySchedules: [
      {
        id: '1',
        dayOfWeek: 1, // Monday
        isAvailable: true,
        startTime: '09:00',
        endTime: '17:00',
        slotDurationMinutes: 30,
      },
      {
        id: '2',
        dayOfWeek: 2, // Tuesday
        isAvailable: true,
        startTime: '09:00',
        endTime: '17:00',
        slotDurationMinutes: 30,
      },
      {
        id: '3',
        dayOfWeek: 3, // Wednesday
        isAvailable: true,
        startTime: '09:00',
        endTime: '17:00',
        slotDurationMinutes: 30,
      },
      {
        id: '4',
        dayOfWeek: 4, // Thursday
        isAvailable: true,
        startTime: '09:00',
        endTime: '17:00',
        slotDurationMinutes: 30,
      },
      {
        id: '5',
        dayOfWeek: 5, // Friday
        isAvailable: true,
        startTime: '09:00',
        endTime: '17:00',
        slotDurationMinutes: 30,
      },
      {
        id: '6',
        dayOfWeek: 6, // Saturday
        isAvailable: false,
        startTime: '',
        endTime: '',
        slotDurationMinutes: 0,
      },
      {
        id: '7',
        dayOfWeek: 0, // Sunday
        isAvailable: false,
        startTime: '',
        endTime: '',
        slotDurationMinutes: 0,
      }
    ],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

@Controller('api/doctors/:doctorId/schedule')
export class ScheduleController {
  @Get()
  findAll(@Param('doctorId') doctorId: string, @Query('startDate') startDate?: string, @Query('endDate') endDate?: string) {
    let filteredSchedules = mockSchedules.filter(s => s.doctorId === doctorId);
    
    if (startDate) {
      filteredSchedules = filteredSchedules.filter(s => s.effectiveFrom >= startDate);
    }
    
    if (endDate) {
      filteredSchedules = filteredSchedules.filter(s => !s.effectiveTo || s.effectiveTo <= endDate);
    }
    
    return filteredSchedules;
  }

  @Get(':id')
  findOne(@Param('doctorId') doctorId: string, @Param('id') id: string) {
    const schedule = mockSchedules.find(s => s.doctorId === doctorId && s.id === id);
    if (!schedule) {
      return { error: 'Schedule not found' };
    }
    return schedule;
  }

  @Post()
  create(@Param('doctorId') doctorId: string, @Body() createScheduleDto: any) {
    const newSchedule = {
      id: uuidv4(),
      doctorId,
      ...createScheduleDto,
      daySchedules: createScheduleDto.daySchedules.map(ds => ({
        id: uuidv4(),
        ...ds,
      })),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    mockSchedules.push(newSchedule);
    return newSchedule;
  }

  @Put(':id')
  update(@Param('doctorId') doctorId: string, @Param('id') id: string, @Body() updateScheduleDto: any) {
    const index = mockSchedules.findIndex(s => s.doctorId === doctorId && s.id === id);
    if (index === -1) {
      return { error: 'Schedule not found' };
    }
    
    const updatedSchedule = {
      ...mockSchedules[index],
      ...updateScheduleDto,
      updatedAt: new Date().toISOString(),
    };
    
    // Update day schedules if provided
    if (updateScheduleDto.daySchedules) {
      updatedSchedule.daySchedules = updateScheduleDto.daySchedules.map(ds => {
        const existingDaySchedule = mockSchedules[index].daySchedules.find(eds => eds.dayOfWeek === ds.dayOfWeek);
        return {
          id: existingDaySchedule ? existingDaySchedule.id : uuidv4(),
          ...ds,
        };
      });
    }
    
    mockSchedules[index] = updatedSchedule;
    return updatedSchedule;
  }

  @Delete(':id')
  remove(@Param('doctorId') doctorId: string, @Param('id') id: string) {
    const index = mockSchedules.findIndex(s => s.doctorId === doctorId && s.id === id);
    if (index === -1) {
      return { error: 'Schedule not found' };
    }
    
    const removedSchedule = mockSchedules.splice(index, 1)[0];
    return { message: 'Schedule removed successfully', schedule: removedSchedule };
  }

  @Get('available-slots')
  getAvailableSlots(@Param('doctorId') doctorId: string, @Query('date') date: string) {
    // Mock available slots
    const availableSlots = [
      { startTime: '09:00', endTime: '09:30', isAvailable: true },
      { startTime: '09:30', endTime: '10:00', isAvailable: true },
      { startTime: '10:00', endTime: '10:30', isAvailable: false },
      { startTime: '10:30', endTime: '11:00', isAvailable: true },
      { startTime: '11:00', endTime: '11:30', isAvailable: true },
      { startTime: '11:30', endTime: '12:00', isAvailable: true },
      { startTime: '14:00', endTime: '14:30', isAvailable: true },
      { startTime: '14:30', endTime: '15:00', isAvailable: false },
      { startTime: '15:00', endTime: '15:30', isAvailable: true },
      { startTime: '15:30', endTime: '16:00', isAvailable: true },
    ];
    
    return availableSlots;
  }
}
