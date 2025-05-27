import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Doctor } from '../../doctor-management/entities/doctor.entity';

export enum LeaveStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
}

@Entity('leaves')
export class Leave {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'doctor_id' })
  doctorId: string;

  @ManyToOne(() => Doctor)
  @JoinColumn({ name: 'doctor_id' })
  doctor: Doctor;

  @Column({ name: 'start_date', type: 'date' })
  startDate: Date;

  @Column({ name: 'end_date', type: 'date' })
  endDate: Date;

  @Column()
  reason: string;

  @Column({
    type: 'enum',
    enum: LeaveStatus,
    default: LeaveStatus.PENDING,
  })
  status: LeaveStatus;

  @Column({ name: 'requested_at', type: 'timestamp' })
  requestedAt: Date;

  @Column({ name: 'approved_at', type: 'timestamp', nullable: true })
  approvedAt: Date;

  @Column({ name: 'approved_by', nullable: true })
  approvedBy: string;

  @Column({ name: 'rejected_at', type: 'timestamp', nullable: true })
  rejectedAt: Date;

  @Column({ name: 'rejected_by', nullable: true })
  rejectedBy: string;

  @Column({ name: 'rejection_reason', nullable: true })
  rejectionReason: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
