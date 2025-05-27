import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): object {
    return {
      message: 'Doctor Appointment System API',
      version: '1.0.0',
      status: 'running',
      endpoints: [
        {
          path: '/api/doctors',
          methods: ['GET', 'POST'],
          description: 'Doctor management endpoints'
        },
        {
          path: '/api/specializations',
          methods: ['GET', 'POST'],
          description: 'Specialization management endpoints'
        },
        {
          path: '/api/capabilities',
          methods: ['GET', 'POST'],
          description: 'Capability management endpoints'
        },
        {
          path: '/api/doctors/:id/schedule',
          methods: ['GET', 'POST'],
          description: 'Schedule management endpoints'
        },
        {
          path: '/api/doctors/:id/leaves',
          methods: ['GET', 'POST'],
          description: 'Leave management endpoints'
        }
      ]
    };
  }
}
