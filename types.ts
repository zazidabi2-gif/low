
export enum Role {
  ADMIN = 'ADMIN',
  TEACHER = 'TEACHER', // Pengajar
  STAFF = 'STAFF',
  GUARDIAN = 'GUARDIAN' // Wali Santri
}

export interface User {
  id: string;
  name: string;
  role: Role;
  username?: string;
  email?: string;
  phone?: string;
  branch?: string; // Cabang
  isActive: boolean;
  avatar?: string;
}

export interface Student {
  id: string; // NIS
  name: string;
  branch: string;
  teacherId: string; // Wali kelas/Ustadz
  grade: string;
  program: 'Tahsin' | 'Tahfidz'; // Added Program Track
  status: 'active' | 'inactive';
  parentName: string;
  phone: string;
  // New Fields
  address?: string;
  school?: string; // Sekolah Asal
  email?: string; // Email Wali
  infaqAmount?: number;
}

export interface Branch {
  id: string;
  name: string;
  address: string;
  phone?: string;
  headName?: string; // Kepala Cabang
}

export interface Attendance {
  id: string;
  userId: string; // Can be student, teacher, or staff ID
  date: string; // ISO Date
  status: 'present' | 'sick' | 'permission' | 'alpha';
  type: 'student' | 'employee';
}

export interface Grade {
  id: string;
  studentId: string;
  type: 'daily' | 'exam'; // Mu'taba'ah or Semester Exam
  subject: string;
  score: number;
  date: string;
  notes?: string;
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense' | 'salary' | 'infaq';
  amount: number;
  date: string;
  description: string;
  relatedUserId?: string; // e.g., Student ID for Infaq, Teacher ID for Salary
  category?: string;
}

export interface OrgStructure {
  id: string;
  position: string;
  holderName: string;
  parentId?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'academic' | 'holiday' | 'exam' | 'event';
  description?: string;
}

export interface AppSettings {
  appName: string;
  foundationName: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  attendanceTarget: number; // Target pertemuan per semester
  announcement?: {
    target: 'all' | 'teacher' | 'guardian';
    message: string;
  };
}