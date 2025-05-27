# 🏥 Schedula - Modern Healthcare Platform

A comprehensive healthcare appointment management system built with modern technologies and elegant design.

## ✨ Features

### 🔐 **Authentication & Authorization**
- JWT-based authentication
- Role-based access control (Doctor/Patient)
- Secure registration and login

### 👨‍⚕️ **Doctor Management**
- Complete doctor profiles with specializations
- Professional information management
- Schedule and appointment oversight

### 👥 **Patient Management**
- Patient registration and profiles
- Medical history tracking
- Appointment booking capabilities

### 📅 **Smart Scheduling**
- Weekly schedule management
- Real-time availability checking
- Automated appointment booking
- Conflict prevention

### 🏖️ **Leave Management**
- Doctor leave requests
- Leave approval system
- Schedule conflict resolution

### 🎨 **Modern UI/UX**
- Elegant gradient design system
- Glass morphism effects
- Responsive design
- Dark mode support
- Smooth animations and transitions

## 🛠️ Tech Stack

### **Backend**
- **Framework**: NestJS
- **Database**: PostgreSQL with TypeORM
- **Authentication**: JWT
- **Validation**: Class Validator
- **API**: RESTful endpoints

### **Frontend**
- **Framework**: Next.js 15 with TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom components with modern design
- **State Management**: React Context
- **Routing**: Next.js App Router

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- PostgreSQL
- npm or yarn

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env` file:
   ```env
   DATABASE_HOST=localhost
   DATABASE_PORT=5432
   DATABASE_USERNAME=your_username
   DATABASE_PASSWORD=your_password
   DATABASE_NAME=schedula
   JWT_SECRET=your_jwt_secret
   ```

4. **Database Setup**
   ```bash
   # Create database
   createdb schedula
   
   # Run migrations (TypeORM will auto-create tables)
   npm run start:dev
   ```

5. **Start the server**
   ```bash
   npm run start:dev
   ```
   Server runs on `http://localhost:3001`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env.local` file:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```
   Application runs on `http://localhost:3000`

## 📱 Application Structure

### **Backend Architecture**
```
backend/
├── src/
│   ├── auth/                 # Authentication module
│   ├── doctor-management/    # Doctor & Patient management
│   ├── schedule-management/  # Appointments & Schedules
│   └── shared/              # Shared utilities
├── database/                # Database schemas
└── test/                   # Test files
```

### **Frontend Architecture**
```
frontend/
├── app/
│   ├── api/                 # API services
│   ├── components/          # Reusable components
│   ├── context/            # React contexts
│   ├── types/              # TypeScript types
│   └── [pages]/            # Next.js pages
├── components/             # Global components
└── public/                # Static assets
```

## 🎯 Key Features Implemented

### **Authentication System**
- ✅ Doctor registration and login
- ✅ Patient registration and login
- ✅ JWT token management
- ✅ Protected routes
- ✅ Role-based access control

### **Doctor Features**
- ✅ Profile management
- ✅ Schedule creation and management
- ✅ Appointment viewing
- ✅ Patient list access
- ✅ Leave request management

### **Patient Features**
- ✅ Doctor browsing
- ✅ Appointment booking
- ✅ Profile management
- ✅ Appointment history

### **Modern UI Features**
- ✅ Responsive design
- ✅ Modern color scheme (Deep navy, cyan accents)
- ✅ Glass morphism effects
- ✅ Gradient buttons and cards
- ✅ Smooth animations
- ✅ Active navigation states
- ✅ Professional healthcare aesthetic

## 🔗 API Endpoints

### **Authentication**
- `POST /auth/register/doctor` - Doctor registration
- `POST /auth/register/patient` - Patient registration
- `POST /auth/login` - User login

### **Doctors**
- `GET /doctors` - List all doctors
- `GET /doctors/me` - Get current doctor profile
- `PUT /doctors/me` - Update doctor profile

### **Patients**
- `GET /patients` - List all patients (doctor only)
- `GET /patients/me` - Get current patient profile

### **Appointments**
- `GET /appointments` - List appointments
- `POST /appointments` - Create appointment
- `PUT /appointments/:id` - Update appointment

### **Schedules**
- `GET /schedules` - List schedules
- `POST /schedules` - Create schedule
- `PUT /schedules/:id` - Update schedule

## 🎨 Design System

### **Color Palette**
- **Primary**: Deep Navy (`#0f172a`)
- **Accent**: Cyan (`#0ea5e9`)
- **Background**: Soft whites and grays
- **Text**: Slate tones for readability

### **Components**
- Modern gradient buttons
- Glass morphism cards
- Elegant form inputs
- Responsive navigation
- Status badges
- Interactive hover effects

## 🚀 Deployment

### **Backend Deployment**
1. Build the application: `npm run build`
2. Set production environment variables
3. Deploy to your preferred platform (Heroku, AWS, etc.)

### **Frontend Deployment**
1. Build the application: `npm run build`
2. Deploy to Vercel, Netlify, or your preferred platform

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 👥 Team

Developed by the Mono Creators team for Pearl Thoughts Internship.

---

**Schedula** - Modern healthcare scheduling made simple and elegant. 🏥✨
