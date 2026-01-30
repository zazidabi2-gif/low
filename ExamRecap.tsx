import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend 
} from 'recharts';
import { User, Role, Student } from '../types';
import { InputExam } from './InputExam'; // Import InputExam component directly here to pass props

interface ExamRecapProps {
  currentUser: User;
  students: Student[];
  examResults: Record<string, any>; // Received from App state
  onUpdateExam: (studentId: string, data: any) => void; // Sync back to App state
}

// Definisi Kriteria Penilaian sesuai Request
const EXAM_CRITERIA = {
  TAHSIN_1: {
    label: 'Tahsin Level 1',
    fields: ['Ketelitian Huruf', 'Ketelitian Harokat']
  },
  TAHSIN_2: {
    label: 'Tahsin Level 2',
    fields: ['Ketelitian Huruf', 'Ketelitian Harokat', 'Kelancaran (Panjang/Pendek)', 'Dengung', 'Sukun & Tasydid']
  },
  TAHSIN_3: {
    label: 'Tahsin Level 3',
    fields: ['Ketelitian Huruf', 'Ketelitian Harokat', 'Kelancaran (Panjang/Pendek)', 'Dengung', 'Sukun & Tasydid', 'Tajwid', 'Gharib']
  },
  TAHFIDZ: {
    label: 'Tahfidz',
    fields: ['Kelancaran Hafalan', 'Kelancaran (Panjang/Pendek)', 'Dengung', 'Sukun & Tasydid', 'Tajwid', 'Gharib']
  }
};

type ExamType = keyof typeof EXAM_CRITERIA;

export const ExamRecap: React.FC<ExamRecapProps> = ({ currentUser, students, examResults, onUpdateExam }) => {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  
  // Logic permissions: Only Teachers can edit/input. Admin/Staff/Guardian are Read-Only.
  const canEdit = currentUser.role === Role.TEACHER;

  // 1. FILTER SISWA SESUAI ROLE
  const myStudents = useMemo(() => {
    let data = students;

    if (currentUser.role === Role.TEACHER) {
      // HANYA tampilkan santri milik pengajar ini
      data = data.filter(s => s.teacherId === currentUser.id);
    } else if (currentUser.role === Role.GUARDIAN) {
      // HANYA tampilkan anak wali santri
      data = data.filter(s => s.id === currentUser.username);
    }
    // Admin & Staf melihat semua
    return data;
  }, [students, currentUser]);

  // 2. OLAH DATA UNTUK GRAFIK
  const chartData = useMemo(() => {
    const stats = {
        TAHSIN_1: { name: 'Tahsin 1', total: 0, count: 0, color: '#3b82f6' },
        TAHSIN_2: { name: 'Tahsin 2', total: 0, count: 0, color: '#8b5cf6' },
        TAHSIN_3: { name: 'Tahsin 3', total: 0, count: 0, color: '#f59e0b' },
        TAHFIDZ: { name: 'Tahfidz', total: 0, count: 0, color: '#10b981' },
    };

    myStudents.forEach(student => {
        const result = examResults[student.id];
        if (result && result.type && stats[result.type as ExamType]) {
            stats[result.type as ExamType].total += result.average;
            stats[result.type as ExamType].count += 1;
        }
    });

    const data = Object.values(stats).map(item => ({
        name: item.name,
        avg: item.count > 0 ? Number((item.total / item.count).toFixed(1)) : 0,
        count: item.count,
        color: item.color
    }));

    return data;
  }, [myStudents, examResults]);

  const hasChartData = chartData.some(d => d.count > 0);

  const handleOpenInput = (student: Student) => {
    setSelectedStudent(student);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Header Section */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Rekap Hasil Ujian</h2>
          <p className="text-slate-500 text-sm mt-1">
            {currentUser.role === Role.TEACHER 
              ? 'Input dan kelola nilai ujian santri bimbingan Anda.' 
              : currentUser.role === Role.GUARDIAN 
              ? 'Lihat hasil evaluasi ujian ananda.'
              : 'Rekapitulasi data hasil ujian (View Only).'}
          </p>
        </div>
        <div className="bg-emerald-50 px-4 py-2 rounded-xl text-emerald-800 text-sm font-bold border border-emerald-100">
          Total Santri: {myStudents.length}
        </div>
      </div>

      {/* --- STATISTIC CHARTS SECTION --- */}
      {hasChartData && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart 1: Average Scores */}
            <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <h3 className="font-bold text-slate-700 mb-4 text-sm uppercase tracking-wider">Rata-rata Nilai per Kategori</h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                            <XAxis type="number" domain={[0, 100]} hide />
                            <YAxis dataKey="name" type="category" width={80} tick={{fontSize: 12, fontWeight: 'bold', fill: '#64748b'}} axisLine={false} tickLine={false} />
                            <Tooltip 
                                cursor={{fill: '#f8fafc'}}
                                contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'}}
                            />
                            <Bar dataKey="avg" radius={[0, 4, 4, 0]} barSize={24} name="Rata-rata Nilai">
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Chart 2: Distribution Count */}
            <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <h3 className="font-bold text-slate-700 mb-4 text-sm uppercase tracking-wider text-center">Distribusi Santri Dinilai</h3>
                <div className="h-64 relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="count"
                                nameKey="name"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{borderRadius: '12px', border: 'none'}} />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="text-center">
                            <span className="block text-3xl font-bold text-slate-800">
                                {chartData.reduce((acc, curr) => acc + curr.count, 0)}
                            </span>
                            <span className="text-xs text-slate-400 font-bold uppercase">Santri</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      )}

      {/* Student Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {myStudents.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-white rounded-3xl border border-dashed border-slate-200 text-slate-400">
            Tidak ada data santri yang tersedia untuk akun Anda.
          </div>
        ) : (
          myStudents.map(student => {
            const result = examResults[student.id];
            const hasScore = !!result;

            return (
              <motion.div 
                key={student.id}
                layout
                onClick={() => handleOpenInput(student)}
                className={`bg-white p-5 rounded-2xl border transition-all cursor-pointer group relative overflow-hidden ${hasScore ? 'border-emerald-200 shadow-md' : 'border-slate-100 shadow-sm hover:border-emerald-300'}`}
              >
                {hasScore && (
                  <div className="absolute top-0 right-0 bg-emerald-500 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl">
                    SUDAH DINILAI
                  </div>
                )}
                
                <div className="flex items-center gap-4 mb-4">
                   <div className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold text-white shadow-lg ${student.program === 'Tahfidz' ? 'bg-gradient-to-br from-emerald-400 to-teal-500' : 'bg-gradient-to-br from-sky-400 to-blue-500'}`}>
                      {student.name.charAt(0)}
                   </div>
                   <div>
                      <h4 className="font-bold text-slate-800 text-lg leading-tight line-clamp-1">{student.name}</h4>
                      <p className="text-xs text-slate-500 mt-1">{student.program} • {student.grade}</p>
                   </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 mt-2">
                   {hasScore ? (
                     <div className="flex justify-between items-center">
                        <div>
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Rata-rata Nilai</p>
                          <p className="text-2xl font-bold text-emerald-600">{result.average}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-slate-400 font-bold uppercase">Kategori</p>
                          <p className="text-xs font-bold text-slate-700">{EXAM_CRITERIA[result.type as ExamType].label}</p>
                        </div>
                     </div>
                   ) : (
                     <div className="text-center py-2">
                        <p className="text-sm font-bold text-slate-400">Belum ada nilai</p>
                        <p className="text-[10px] text-emerald-600 mt-1 group-hover:underline font-bold">
                            {canEdit ? 'Klik untuk input' : 'Menunggu input Pengajar'}
                        </p>
                     </div>
                   )}
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* INPUT/VIEW MODAL */}
      <AnimatePresence>
        {selectedStudent && (
          <InputExam 
            isOpen={true}
            onClose={() => setSelectedStudent(null)}
            currentUser={currentUser}
            students={students}
            onSave={(data) => {
                const studentId = selectedStudent.id;
                const studentData = data[studentId];
                if(studentData) {
                    onUpdateExam(studentId, studentData);
                }
            }}
            existingResults={examResults}
            readOnly={!canEdit}
          />
        )}
      </AnimatePresence>
    </div>
  );
};