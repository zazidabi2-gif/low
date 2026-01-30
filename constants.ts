
import { User, Role, Student, OrgStructure, CalendarEvent, AppSettings, Transaction, Attendance, Branch } from './types';

export const DEFAULT_SETTINGS: AppSettings = {
  appName: 'TunTaz Madani',
  foundationName: 'Yayasan Tunas Tahfidz Madani',
  logoUrl: 'https://cdn-icons-png.flaticon.com/512/2883/2883656.png', // Placeholder Islamic logo
  primaryColor: 'emerald',
  secondaryColor: 'sky',
  attendanceTarget: 120, // Default target meetings per semester
};

// --- DATA SIMULASI BARU ---

// 1. DATA CABANG
export const INITIAL_BRANCHES: Branch[] = [
  { 
    id: 'BR_MADANI', 
    name: 'Tuntaz Masjid Madani', 
    address: 'Jl. Masjid Madani No. 1, Surabaya', 
    phone: '081234567001', 
    headName: 'Ust. Sayyadi' 
  },
  { 
    id: 'BR_NGAGEL', 
    name: 'Tuntaz Ngagel', 
    address: 'Jl. Ngagel Rejo No. 10, Surabaya', 
    phone: '081234567002', 
    headName: 'Ust. Choiron' 
  },
];

// 2. DATA USER (ADMIN, PENGAJAR, STAF)
export const INITIAL_USERS: User[] = [
  // Admin
  { id: 'admin1', name: 'Admin Pusat', username: 'admin', role: Role.ADMIN, isActive: true },
  
  // Pengajar Tuntaz Masjid Madani
  { 
    id: 'u_sayyadi', 
    name: 'Ustadz Sayyadi', 
    username: 'sayyadi', 
    role: Role.TEACHER, 
    branch: 'Tuntaz Masjid Madani', 
    isActive: true, 
    phone: '081211112222' 
  },

  // Pengajar Tuntaz Ngagel
  { 
    id: 'u_choiron', 
    name: 'Ustadz Choiron', 
    username: 'choiron', 
    role: Role.TEACHER, 
    branch: 'Tuntaz Ngagel', 
    isActive: true, 
    phone: '081233334444' 
  },

  // Staf
  { id: 'staf1', name: 'Staf Administrasi', username: 'staf', role: Role.STAFF, branch: 'Tuntaz Masjid Madani', isActive: true },
  
  // Contoh Wali Santri Login
  { id: 'g1', name: 'Wali Santri Ahmad', role: Role.GUARDIAN, username: 'NIS001', isActive: true }, 
];

// 3. DATA SANTRI (10 Santri per Ustadz, Campur Tahsin & Tahfidz)
export const INITIAL_STUDENTS: Student[] = [
  // --- SANTRI USTADZ SAYYADI (Tuntaz Masjid Madani) ---
  { id: 'NIS001', name: 'Ahmad Fikri', branch: 'Tuntaz Masjid Madani', teacherId: 'u_sayyadi', grade: 'Juz 30', program: 'Tahfidz', status: 'active', parentName: 'Bpk. Fikri', phone: '0811111', infaqAmount: 200000 },
  { id: 'NIS002', name: 'Budi Santoso', branch: 'Tuntaz Masjid Madani', teacherId: 'u_sayyadi', grade: 'Level 1', program: 'Tahsin', status: 'active', parentName: 'Bpk. Santoso', phone: '0811112', infaqAmount: 150000 },
  { id: 'NIS003', name: 'Citra Kirana', branch: 'Tuntaz Masjid Madani', teacherId: 'u_sayyadi', grade: 'Juz 29', program: 'Tahfidz', status: 'active', parentName: 'Bpk. Kirana', phone: '0811113', infaqAmount: 250000 },
  { id: 'NIS004', name: 'Dewi Sartika', branch: 'Tuntaz Masjid Madani', teacherId: 'u_sayyadi', grade: 'Level 2', program: 'Tahsin', status: 'active', parentName: 'Bpk. Sartika', phone: '0811114', infaqAmount: 150000 },
  { id: 'NIS005', name: 'Eko Prasetyo', branch: 'Tuntaz Masjid Madani', teacherId: 'u_sayyadi', grade: 'Juz 30', program: 'Tahfidz', status: 'active', parentName: 'Bpk. Prasetyo', phone: '0811115', infaqAmount: 200000 },
  { id: 'NIS006', name: 'Fajar Nugraha', branch: 'Tuntaz Masjid Madani', teacherId: 'u_sayyadi', grade: 'Level 3', program: 'Tahsin', status: 'active', parentName: 'Bpk. Nugraha', phone: '0811116', infaqAmount: 175000 },
  { id: 'NIS007', name: 'Gita Gutawa', branch: 'Tuntaz Masjid Madani', teacherId: 'u_sayyadi', grade: 'Juz 1', program: 'Tahfidz', status: 'active', parentName: 'Bpk. Gutawa', phone: '0811117', infaqAmount: 300000 },
  { id: 'NIS008', name: 'Hadi Sucipto', branch: 'Tuntaz Masjid Madani', teacherId: 'u_sayyadi', grade: 'Level 1', program: 'Tahsin', status: 'active', parentName: 'Bpk. Sucipto', phone: '0811118', infaqAmount: 150000 },
  { id: 'NIS009', name: 'Indah Permata', branch: 'Tuntaz Masjid Madani', teacherId: 'u_sayyadi', grade: 'Juz 30', program: 'Tahfidz', status: 'active', parentName: 'Bpk. Permata', phone: '0811119', infaqAmount: 200000 },
  { id: 'NIS010', name: 'Joko Anwar', branch: 'Tuntaz Masjid Madani', teacherId: 'u_sayyadi', grade: 'Level 2', program: 'Tahsin', status: 'active', parentName: 'Bpk. Anwar', phone: '0811120', infaqAmount: 150000 },

  // --- SANTRI USTADZ CHOIRON (Tuntaz Ngagel) ---
  { id: 'NIS011', name: 'Kiki Amalia', branch: 'Tuntaz Ngagel', teacherId: 'u_choiron', grade: 'Level 3', program: 'Tahsin', status: 'active', parentName: 'Bpk. Amalia', phone: '0822221', infaqAmount: 175000 },
  { id: 'NIS012', name: 'Lukman Hakim', branch: 'Tuntaz Ngagel', teacherId: 'u_choiron', grade: 'Juz 30', program: 'Tahfidz', status: 'active', parentName: 'Bpk. Hakim', phone: '0822222', infaqAmount: 200000 },
  { id: 'NIS013', name: 'Mira Lesmana', branch: 'Tuntaz Ngagel', teacherId: 'u_choiron', grade: 'Level 1', program: 'Tahsin', status: 'active', parentName: 'Bpk. Lesmana', phone: '0822223', infaqAmount: 150000 },
  { id: 'NIS014', name: 'Nanda Putra', branch: 'Tuntaz Ngagel', teacherId: 'u_choiron', grade: 'Juz 29', program: 'Tahfidz', status: 'active', parentName: 'Bpk. Putra', phone: '0822224', infaqAmount: 250000 },
  { id: 'NIS015', name: 'Omar Daniel', branch: 'Tuntaz Ngagel', teacherId: 'u_choiron', grade: 'Level 2', program: 'Tahsin', status: 'active', parentName: 'Bpk. Daniel', phone: '0822225', infaqAmount: 150000 },
  { id: 'NIS016', name: 'Putri Titian', branch: 'Tuntaz Ngagel', teacherId: 'u_choiron', grade: 'Juz 30', program: 'Tahfidz', status: 'active', parentName: 'Bpk. Titian', phone: '0822226', infaqAmount: 200000 },
  { id: 'NIS017', name: 'Qori Sandioriva', branch: 'Tuntaz Ngagel', teacherId: 'u_choiron', grade: 'Level 3', program: 'Tahsin', status: 'active', parentName: 'Bpk. Sandioriva', phone: '0822227', infaqAmount: 175000 },
  { id: 'NIS018', name: 'Rina Nose', branch: 'Tuntaz Ngagel', teacherId: 'u_choiron', grade: 'Juz 28', program: 'Tahfidz', status: 'active', parentName: 'Bpk. Nose', phone: '0822228', infaqAmount: 300000 },
  { id: 'NIS019', name: 'Sari Roti', branch: 'Tuntaz Ngagel', teacherId: 'u_choiron', grade: 'Level 1', program: 'Tahsin', status: 'active', parentName: 'Bpk. Roti', phone: '0822229', infaqAmount: 150000 },
  { id: 'NIS020', name: 'Tono Sudirjo', branch: 'Tuntaz Ngagel', teacherId: 'u_choiron', grade: 'Level 2', program: 'Tahsin', status: 'active', parentName: 'Bpk. Sudirjo', phone: '0822230', infaqAmount: 150000 },
];

export const INITIAL_STRUCTURE: OrgStructure[] = [
  { id: '1', position: 'Ketua Yayasan', holderName: 'H. Abdullah' },
  { id: '2', position: 'Kepala Sekolah', holderName: 'Ust. Admin Pusat', parentId: '1' },
  { id: '3', position: 'Koord. Masjid Madani', holderName: 'Ust. Sayyadi', parentId: '2' },
  { id: '4', position: 'Koord. Ngagel', holderName: 'Ust. Choiron', parentId: '2' },
  { id: '5', position: 'Administrasi', holderName: 'Staf Admin', parentId: '2' },
];

export const INITIAL_CALENDAR: CalendarEvent[] = [
  { id: '1', title: 'Awal Semester Ganjil', date: '2024-07-15', type: 'academic' },
  { id: '2', title: 'Ujian Kenaikan Level', date: '2024-09-20', type: 'exam', description: 'Persiapkan hafalan' },
  { id: '3', title: 'Maulid Nabi', date: '2024-09-16', type: 'holiday' },
];

// Added some recent transactions for demo
export const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: 'tr1', type: 'income', amount: 5000000, date: '2024-05-01', description: 'Donasi Yayasan' },
  { id: 'tr2', type: 'expense', amount: 1200000, date: '2024-05-05', description: 'Beli ATK' },
  // Simulasi Infaq Santri (Sudah bayar)
  { id: 'tr3', type: 'infaq', amount: 200000, date: new Date().toISOString(), description: 'SPP Bulan Ini', relatedUserId: 'NIS001' },
  { id: 'tr4', type: 'infaq', amount: 175000, date: new Date().toISOString(), description: 'SPP Bulan Ini', relatedUserId: 'NIS011' },
];

export const INITIAL_ATTENDANCE: Attendance[] = [
  { id: 'at1', userId: 'u_sayyadi', date: '2024-05-26', status: 'present', type: 'employee' },
  { id: 'at2', userId: 'u_choiron', date: '2024-05-27', status: 'present', type: 'employee' },
  { id: 'at3', userId: 'NIS001', date: '2024-05-27', status: 'present', type: 'student' },
];

// Helper to generate dates for charts
export const generateChartData = () => {
  return [
    { name: 'Jan', students: 120, attendance: 95 },
    { name: 'Feb', students: 125, attendance: 92 },
    { name: 'Mar', students: 128, attendance: 96 },
    { name: 'Apr', students: 130, attendance: 94 },
    { name: 'May', students: 145, attendance: 98 },
    { name: 'Jun', students: 150, attendance: 97 },
  ];
};
