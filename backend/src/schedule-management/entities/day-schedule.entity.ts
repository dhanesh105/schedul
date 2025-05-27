import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { WeeklySchedule } from './weekly-schedule.entity';

@Entity('day_schedules')
export class DaySchedule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'weekly_schedule_id' })
  weeklyScheduleId: string;

  @ManyToOne(() => WeeklySchedule, weeklySchedule => weeklySchedule.daySchedules)
  @JoinColumn({ name: 'weekly_schedule_id' })
  weeklySchedule: WeeklySchedule;

  @Column({ name: 'day_of_week' })
  dayOfWeek: number;

  @Column({ name: 'is_available', default: true })
  isAvailable: boolean;

  @Column({ name: 'start_time', type: 'time' })
  startTime: string;

  @Column({ name: 'end_time', type: 'time' })
  endTime: string;

  @Column({ name: 'slot_duration_minutes', default: 30 })
  slotDurationMinutes: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
