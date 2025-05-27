-- Create extension for UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Doctors Table
CREATE TABLE doctors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  gender VARCHAR(10) CHECK (gender IN ('MALE', 'FEMALE', 'OTHER')),
  email VARCHAR(255) UNIQUE NOT NULL,
  phone VARCHAR(20) UNIQUE NOT NULL,
  registration_number VARCHAR(50) UNIQUE NOT NULL,
  qualifications TEXT[],
  biography TEXT,
  profile_image_url VARCHAR(255),
  status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'SUSPENDED')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Specializations Table
CREATE TABLE specializations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  icon VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Doctor Specializations (Junction Table)
CREATE TABLE doctor_specializations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  specialization_id UUID NOT NULL REFERENCES specializations(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(doctor_id, specialization_id)
);

-- Capabilities Table
CREATE TABLE capabilities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Doctor Capabilities (Junction Table)
CREATE TABLE doctor_capabilities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  capability_id UUID NOT NULL REFERENCES capabilities(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(doctor_id, capability_id)
);

-- Weekly Schedules Table
CREATE TABLE weekly_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  effective_from DATE NOT NULL,
  effective_to DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT effective_date_check CHECK (effective_to IS NULL OR effective_from <= effective_to)
);

-- Day Schedules Table
CREATE TABLE day_schedules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  weekly_schedule_id UUID NOT NULL REFERENCES weekly_schedules(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
  is_available BOOLEAN NOT NULL DEFAULT true,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  slot_duration_minutes INTEGER NOT NULL DEFAULT 30,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT time_range_check CHECK (start_time < end_time),
  CONSTRAINT slot_duration_check CHECK (slot_duration_minutes > 0),
  UNIQUE(weekly_schedule_id, day_of_week)
);

-- Leaves Table
CREATE TABLE leaves (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  reason TEXT,
  status VARCHAR(20) NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED')),
  requested_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  approved_by UUID,
  approved_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT leave_date_check CHECK (start_date <= end_date)
);

-- Domain Events Table for Event Sourcing
CREATE TABLE domain_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  aggregate_type VARCHAR(100) NOT NULL,
  aggregate_id UUID NOT NULL,
  event_type VARCHAR(100) NOT NULL,
  event_data JSONB NOT NULL,
  occurred_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  processed BOOLEAN DEFAULT FALSE
);

-- Indexes for better query performance
CREATE INDEX idx_doctors_email ON doctors(email);
CREATE INDEX idx_doctors_phone ON doctors(phone);
CREATE INDEX idx_doctors_status ON doctors(status);
CREATE INDEX idx_doctor_specializations_doctor_id ON doctor_specializations(doctor_id);
CREATE INDEX idx_doctor_specializations_specialization_id ON doctor_specializations(specialization_id);
CREATE INDEX idx_doctor_capabilities_doctor_id ON doctor_capabilities(doctor_id);
CREATE INDEX idx_doctor_capabilities_capability_id ON doctor_capabilities(capability_id);
CREATE INDEX idx_weekly_schedules_doctor_id ON weekly_schedules(doctor_id);
CREATE INDEX idx_weekly_schedules_effective_dates ON weekly_schedules(effective_from, effective_to);
CREATE INDEX idx_day_schedules_weekly_schedule_id ON day_schedules(weekly_schedule_id);
CREATE INDEX idx_day_schedules_day_of_week ON day_schedules(day_of_week);
CREATE INDEX idx_leaves_doctor_id ON leaves(doctor_id);
CREATE INDEX idx_leaves_date_range ON leaves(start_date, end_date);
CREATE INDEX idx_leaves_status ON leaves(status);
CREATE INDEX idx_domain_events_aggregate ON domain_events(aggregate_type, aggregate_id);
CREATE INDEX idx_domain_events_processed ON domain_events(processed);
CREATE INDEX idx_domain_events_occurred_at ON domain_events(occurred_at);
