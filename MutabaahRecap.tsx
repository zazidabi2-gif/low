import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { User, Role, Student } from '../types';

interface MutabaahRecapProps {
  currentUser: User;
  students: Student[];
}

// Colors for Charts
const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

export const MutabaahRecap: React.FC<MutabaahRecapProps> = ({ currentUser, students }) => {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  
  // Filters State (Only used for Admin/Staff)
  const [filterBranch, setFilterBranch] = useState<string>('All');
  const [filterTeacher, setFilterTeacher] = useState<string>('All');
  const [filterGrade, setFilterGrade] = useState<string>('All');

  // --- 1. FILTERING LOGIC ---
  const filteredStudents = useMemo(() => {
    let data = students;

    // A. Role Based Restriction
    if (currentUser.role === Role.GUARDIAN) {
      // Assuming username corresponds to NIS
      data = data.filter(s => s.id === currentUser.username);
    } else if (currentUser.role === Role.TEACHER) {
      data = data.filter(s => s.teacherId === currentUser.id);
    } 
    
    // B. Admin/Staff UI Filters
    if (currentUser.role === Role.ADMIN || currentUser.role === Role.STAFF) {
      if (filterBranch !== 'All') {
        data = data.filter(s => s.branch === filterBranch);
      }
      if (filterTeacher !== 'All') {
        data = data.filter(s => s.teacherId === filterTeacher);
      }
      if (filterGrade !== 'All') {
        data = data.filter(s => s.grade === filterGrade);
      }
    }

    return data;
  }, [students, currentUser, filterBranch, filterTeacher, filterGrade]);

  // Extract unique values for Dropdowns
  const uniqueBranches = useMemo(() => Array.from(new Set(students.map(s => s.branch))), [students]);
  // For teachers, we just show IDs for now as mapping is in Users array (simplified for this component)
  const uniqueTeachers = useMemo(() => Array.from(new Set(students.map(s => s.teacherId))), [students]); 
  const uniqueGrades = useMemo(() => Array.from(new Set(students.map(s => s.grade))), [students]);


  // --- 2. DATA GENERATION FOR CHARTS ---

  // Chart A: Tren Setoran (Mock Data Aggregate based on filtered count)
  const trendData = useMemo(() => {
    const baseCount = filteredStudents.length;
    return [
      { day: 'Sen', setoran: Math.round(baseCount * 0.8) },
      { day: 'Sel', setoran: Math.round(baseCount * 0.9) },
      { day: 'Rab', setoran: Math.round(baseCount * 0.85) },
      { day: 'Kam', setoran: Math.round(baseCount * 0.95) },
      { day: 'Jum', setoran: Math.round(baseCount * 0.6) }, // Usually lower on Friday
      { day: 'Sab', setoran: Math.round(baseCount * 0.4) },
    ];
  }, [filteredStudents.length]);

  // Chart B: Rata-rata Nilai per Tingkat (Grade)
  const gradeScoreData = useMemo(() => {
    const groups: Record<string, { total: number, count: number }> = {};
    
    filteredStudents.forEach(s => {
      if (!groups[s.grade]) groups[s.grade] = { total: 0, count: 0 };
      // Mock score generation based on name length for consistency
      const mockScore = 7 + (s.name.length % 3); 
      groups[s.grade].total += mockScore;
      groups[s.grade].count += 1;
    });

    return Object.keys(groups).map(grade => ({
      name: grade,
      avg: Number((groups[grade].total / groups[grade].count).toFixed(1))
    }));
  }, [filteredStudents]);

  // Chart C: Program Distribution
  const programData = useMemo(() => {
    const tahfidzCount = filteredStudents.filter(s => s.program === 'Tahfidz').length;
    const tahsinCount = filteredStudents.filter(s => s.program === 'Tahsin').length;
    return [
      { name: 'Tahfidz', value: tahfidzCount },
      { name: 'Tahsin', value: tahsinCount },
    ];
  }, [filteredStudents]);

  // NEW CHART D: Semester Progress (Time to Time)
  const semesterProgressData = useMemo(() => {
    // Generate simulated progressive data
    return [
      { name: 'Januari', rataRata: 7.2, target: 7.0, pencapaian: 65 },
      { name: 'Februari', rataRata: 7.5, target: 7.2, pencapaian: 70 },
      { name: 'Maret', rataRata: 7.4, target: 7.4, pencapaian: 75 },
      { name: 'April', rataRata: 7.8, target: 7.6, pencapaian: 82 },
      { name: 'Mei', rataRata: 8.2, target: 7.8, pencapaian: 88 },
      { name: 'Juni', rataRata: 8.5, target: 8.0, pencapaian: 92 },
    ];
  }, []);

  // --- Helper for Individual Student Card ---
  const getStudentStats = (student: Student) => {
    const isTahfidz = student.program === 'Tahfidz';
    return {
      ziyadah: isTahfidz ? `${(student.name.length % 30) + 1} Juz` : `Jilid ${(student.name.length % 6) + 1}`,
      score: 7 + (student.name.length % 4), // Mock score 7-10
      status: (student.name.length % 2 === 0) ? 'Lancar' : 'Perlu Murojaah'
    };
  };

  return (
    <div className="space-y-8 animate-fade-in pb-10">
      
      {/* HEADER & FILTER SECTION */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
         <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Rekapitulasi Mu'taba'ah</h2>
              <p className="text-slate-500 text-sm mt-1">
                {currentUser.role === Role.GUARDIAN ? 'Memantau perkembangan hafalan ananda.' : 
                 currentUser.role === Role.TEACHER ? 'Data perkembangan santri bimbingan Anda.' :
                 'Data global seluruh cabang dan kelas.'}
              </p>
            </div>
            
            {/* Filter Controls (Admin/Staff Only) */}
            {(currentUser.role === Role.ADMIN || currentUser.role === Role.STAFF) && (
              <div className="flex flex-wrap gap-2 w-full md:w-auto">
                <select 
                  value={filterBranch} 
                  onChange={(e) => setFilterBranch(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-emerald-500"
                >
                  <option value="All">Semua Cabang</option>
                  {uniqueBranches.map(b => <option key={b} value={b}>{b}</option>)}
                </select>

                <select 
                  value={filterTeacher} 
                  onChange={(e) => setFilterTeacher(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-emerald-500"
                >
                  <option value="All">Semua Pengajar</option>
                  {uniqueTeachers.map(t => <option key={t} value={t}>{t}</option>)}
                </select>

                <select 
                  value={filterGrade} 
                  onChange={(e) => setFilterGrade(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-emerald-500"
                >
                  <option value="All">Semua Tingkat</option>
                  {uniqueGrades.map(g => <option key={g} value={g}>{g}</option>)}
                </select>
              </div>
            )}
         </div>

         {/* --- 3 SMALL CHARTS SECTION --- */}
         {filteredStudents.length > 0 ? (
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Chart 1: Tren Aktivitas */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                 <h4 className="text-sm font-bold text-slate-700 mb-4 text-center">Tren Setoran Harian</h4>
                 <div className="h-40">
                    <ResponsiveContainer width="100%" height="100%">
                       <AreaChart data={trendData}>
                          <defs>
                             <linearGradient id="colorSetoran" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                             </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                          <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                          <Tooltip contentStyle={{borderRadius: '8px', border: 'none', fontSize: '12px'}} />
                          <Area type="monotone" dataKey="setoran" stroke="#10b981" fillOpacity={1} fill="url(#colorSetoran)" strokeWidth={2} />
                       </AreaChart>
                    </ResponsiveContainer>
                 </div>
              </div>

              {/* Chart 2: Rata-rata Nilai per Tingkat */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                 <h4 className="text-sm font-bold text-slate-700 mb-4 text-center">Rata-rata Nilai per Kelas</h4>
                 <div className="h-40">
                    <ResponsiveContainer width="100%" height="100%">
                       <BarChart data={gradeScoreData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                          <Tooltip contentStyle={{borderRadius: '8px', border: 'none', fontSize: '12px'}} cursor={{fill: 'transparent'}} />
                          <Bar dataKey="avg" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={20} />
                       </BarChart>
                    </ResponsiveContainer>
                 </div>
              </div>

              {/* Chart 3: Distribusi Program */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                 <h4 className="text-sm font-bold text-slate-700 mb-4 text-center">Komposisi Program</h4>
                 <div className="h-40">
                    <ResponsiveContainer width="100%" height="100%">
                       <PieChart>
                          <Pie
                             data={programData}
                             cx="50%" cy="50%"
                             innerRadius={30} outerRadius={50}
                             paddingAngle={5} dataKey="value"
                          >
                             {programData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.name === 'Tahfidz' ? '#10b981' : '#3b82f6'} />
                             ))}
                          </Pie>
                          <Tooltip contentStyle={{borderRadius: '8px', border: 'none', fontSize: '12px'}} />
                          <Legend verticalAlign="bottom" height={20} iconType="circle" wrapperStyle={{fontSize: '10px'}}/>
                       </PieChart>
                    </ResponsiveContainer>
                 </div>
              </div>
           </div>
         ) : (
           <div className="p-8 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
             Tidak ada data grafik untuk filter yang dipilih.
           </div>
         )}
      </div>

      {/* --- NEW LARGE CHART: SEMESTER PROGRESS --- */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
         <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-800">Progres Kualitas Hafalan Semester Ini</h3>
            <div className="flex gap-4 text-xs font-bold">
               <div className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
                  <span className="text-slate-600">Nilai Rata-rata</span>
               </div>
               <div className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded-full bg-blue-300"></span>
                  <span className="text-slate-600">Target</span>
               </div>
            </div>
         </div>
         <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
               <AreaChart data={semesterProgressData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                  <defs>
                     <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                     </linearGradient>
                     <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                     </linearGradient>
                  </defs>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} domain={[0, 10]} />
                  <CartesianGrid vertical={false} stroke="#f1f5f9" />
                  <Tooltip 
                     contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)'}}
                     cursor={{stroke: '#cbd5e1', strokeDasharray: '4 4'}}
                  />
                  <Area 
                     type="monotone" 
                     dataKey="rataRata" 
                     stroke="#10b981" 
                     strokeWidth={3}
                     fillOpacity={1} 
                     fill="url(#colorAvg)" 
                     activeDot={{r: 6, strokeWidth: 0}}
                  />
                  <Area 
                     type="monotone" 
                     dataKey="target" 
                     stroke="#93c5fd" 
                     strokeWidth={2}
                     strokeDasharray="5 5"
                     fillOpacity={1} 
                     fill="url(#colorTarget)" 
                  />
               </AreaChart>
            </ResponsiveContainer>
         </div>
      </div>

      {/* DATA GRID */}
      <div>
        <h3 className="text-xl font-bold text-slate-800 mb-4">Daftar Santri ({filteredStudents.length})</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
           {filteredStudents.length === 0 ? (
             <div className="col-span-full text-center py-10 text-slate-400 bg-white rounded-3xl border border-slate-100">
               Tidak ada data santri ditemukan.
             </div>
           ) : (
             filteredStudents.map(student => {
               const stats = getStudentStats(student);
               return (
                 <motion.div 
                   key={student.id}
                   layout
                   initial={{ opacity: 0, scale: 0.9 }}
                   animate={{ opacity: 1, scale: 1 }}
                   whileHover={{ y: -5 }}
                   onClick={() => setSelectedStudent(student)}
                   className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg hover:border-emerald-200 transition-all cursor-pointer group relative overflow-hidden"
                 >
                   <div className="absolute top-0 right-0 p-3">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${student.program === 'Tahfidz' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                        {student.program}
                      </span>
                   </div>

                   <div className="flex items-center gap-4 mb-4 mt-2">
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center font-bold text-white text-xl shadow-md ${student.program === 'Tahfidz' ? 'bg-gradient-to-br from-emerald-400 to-teal-500' : 'bg-gradient-to-br from-blue-400 to-indigo-500'}`}>
                        {student.name.charAt(0)}
                      </div>
                      <div>
                         <h4 className="font-bold text-slate-800 line-clamp-1 text-lg">{student.name}</h4>
                         <p className="text-xs text-slate-500 font-medium">{student.grade} • {student.branch}</p>
                      </div>
                   </div>
                   
                   <div className="grid grid-cols-2 gap-2 mt-4">
                      <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                         <p className="text-[10px] text-slate-400 font-bold uppercase">Capaian</p>
                         <p className="text-sm font-bold text-slate-700">{stats.ziyadah}</p>
                      </div>
                      <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                         <p className="text-[10px] text-slate-400 font-bold uppercase">Nilai Akhir</p>
                         <div className="flex items-center gap-1">
                            <span className={`text-sm font-bold ${stats.score >= 9 ? 'text-emerald-600' : stats.score >= 7 ? 'text-yellow-600' : 'text-red-600'}`}>
                              {stats.score}/10
                            </span>
                         </div>
                      </div>
                   </div>
                   
                   <div className="mt-3 pt-3 border-t border-slate-50 flex justify-between items-center">
                      <span className="text-xs text-slate-400">Status: {stats.status}</span>
                      <span className="text-xs font-bold text-emerald-600 group-hover:underline">Lihat Detail</span>
                   </div>
                 </motion.div>
               );
             })
           )}
        </div>
      </div>

      {/* DETAIL MODAL (Enhanced Clean Look) */}
      <AnimatePresence>
         {selectedStudent && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
               <motion.div 
                 initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                 className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                 onClick={() => setSelectedStudent(null)}
               />
               <motion.div 
                 initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                 className="bg-white rounded-3xl w-full max-w-lg relative z-10 shadow-2xl flex flex-col max-h-[90vh]"
               >
                  {/* Modal Header */}
                  <div className={`p-6 pb-8 text-white relative overflow-hidden ${selectedStudent.program === 'Tahfidz' ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gradient-to-r from-blue-500 to-indigo-500'}`}>
                     <div className="absolute top-0 right-0 p-4">
                        <button onClick={() => setSelectedStudent(null)} className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors">✕</button>
                     </div>
                     <div className="flex items-center gap-4 relative z-10">
                        <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-4xl font-bold shadow-lg" style={{color: selectedStudent.program === 'Tahfidz' ? '#10b981' : '#3b82f6'}}>
                           {selectedStudent.name.charAt(0)}
                        </div>
                        <div>
                           <h3 className="text-2xl font-bold">{selectedStudent.name}</h3>
                           <p className="opacity-90">{selectedStudent.program} • {selectedStudent.grade}</p>
                           <p className="text-xs mt-1 bg-black/20 inline-block px-2 py-0.5 rounded">{selectedStudent.id}</p>
                        </div>
                     </div>
                  </div>

                  {/* Modal Content */}
                  <div className="p-6 overflow-y-auto bg-slate-50/50 flex-1">
                     <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 mb-6">
                        <h4 className="font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Grafik Perkembangan Santri</h4>
                        <div className="h-48 w-full">
                           <ResponsiveContainer width="100%" height="100%">
                              <LineChart data={[
                                { t: 'P1', s: 7 }, { t: 'P2', s: 7.5 }, { t: 'P3', s: 8 }, { t: 'P4', s: 7.5 }, { t: 'P5', s: 8.5 }, { t: 'P6', s: 9 }
                              ]}>
                                 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                 <XAxis dataKey="t" hide />
                                 <YAxis domain={[0, 10]} hide />
                                 <Tooltip contentStyle={{borderRadius: '8px', border: 'none'}} />
                                 <Line type="monotone" dataKey="s" stroke={selectedStudent.program === 'Tahfidz' ? '#10b981' : '#3b82f6'} strokeWidth={3} dot={{r:4, strokeWidth:0, fill: selectedStudent.program === 'Tahfidz' ? '#10b981' : '#3b82f6'}} />
                              </LineChart>
                           </ResponsiveContainer>
                        </div>
                     </div>

                     <h4 className="font-bold text-slate-800 mb-3">Riwayat Setoran Terbaru</h4>
                     <div className="space-y-3">
                        {[1, 2, 3, 4].map(i => (
                           <div key={i} className="flex justify-between items-center p-4 bg-white rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                              <div className="flex items-center gap-3">
                                 <div className="flex flex-col items-center justify-center w-10 h-10 bg-slate-100 rounded-lg text-slate-500">
                                    <span className="text-xs font-bold">MEI</span>
                                    <span className="text-sm font-bold">{20 + i}</span>
                                 </div>
                                 <div>
                                    <p className="text-xs text-slate-400 font-bold mb-0.5">Muroja'ah Hafalan</p>
                                    <p className="font-bold text-slate-700 text-sm">
                                       {selectedStudent.program === 'Tahfidz' ? `Juz 30 Hal ${10 + i}` : `Jilid 4 Hal ${5 + i}`}
                                    </p>
                                 </div>
                              </div>
                              <div className="text-right">
                                 <div className={`text-lg font-bold ${9 - (i%2) >= 8 ? 'text-emerald-500' : 'text-yellow-500'}`}>
                                    {9 - (i % 2)}
                                 </div>
                              </div>
                           </div>
                        ))}
                     </div>
                  </div>
               </motion.div>
            </div>
         )}
      </AnimatePresence>

    </div>
  );
};