import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, YAxis
} from 'recharts';
import { User, Role, AppSettings, Student } from '../types';

interface AttendanceRecapProps {
  currentUser: User;
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  students: Student[];
}

// Helper to generate trend data for the modal
const generateTrendData = () => [
  { name: 'Bulan 1', hadir: 90, izin: 2, alpha: 0 },
  { name: 'Bulan 2', hadir: 95, izin: 1, alpha: 1 },
  { name: 'Bulan 3', hadir: 88, izin: 4, alpha: 0 },
  { name: 'Bulan 4', hadir: 98, izin: 0, alpha: 0 },
  { name: 'Bulan 5', hadir: 92, izin: 2, alpha: 1 },
  { name: 'Bulan 6', hadir: 96, izin: 1, alpha: 0 },
];

const COLORS = {
  Hadir: '#10b981', // Emerald
  Izin: '#3b82f6',  // Blue
  Sakit: '#f59e0b', // Amber
  Alpha: '#ef4444'  // Red
};

export const AttendanceRecap: React.FC<AttendanceRecapProps> = ({ currentUser, settings, onUpdateSettings, students }) => {
  const [activeTab, setActiveTab] = useState<'student' | 'teacher' | 'staff'>('student');
  const [studentClass, setStudentClass] = useState<'tahsin' | 'tahfidz'>('tahfidz');
  const [isEditingTarget, setIsEditingTarget] = useState(false);
  const [tempTarget, setTempTarget] = useState(settings.attendanceTarget);
  const [selectedItem, setSelectedItem] = useState<any | null>(null);

  // Admin Filter
  const uniqueBranches = useMemo(() => Array.from(new Set(students.map(s => s.branch))), [students]);
  // Default to first branch, no 'All' option
  const [filterBranch, setFilterBranch] = useState<string>(uniqueBranches[0] || 'Cabang Pusat');
  
  // Ensure filterBranch is set when uniqueBranches populates
  useEffect(() => {
     if (uniqueBranches.length > 0 && !uniqueBranches.includes(filterBranch)) {
         setFilterBranch(uniqueBranches[0]);
     }
  }, [uniqueBranches, filterBranch]);

  // --- MOCK DATA GENERATION BASED ON FILTERS ---
  // In a real app, this would be an API call or filtering a large 'attendance' dataset.
  
  const currentData = useMemo(() => {
     let data: any[] = [];

     // CASE 1: GUARDIAN - Only see own child
     if (currentUser.role === Role.GUARDIAN) {
        if (activeTab === 'student') {
             // Mock data for child
             return [{
                id: 'child1',
                name: 'Ananda Yusuf (Anak Anda)',
                category: 'Tahfidz',
                branch: 'Cabang A',
                stats: { weekly: { h: 5, i: 0, a: 0 }, monthly: { h: 20, i: 1, a: 0 }, semester: { h: 95, i: 3, a: 1 } }
             }];
        }
        return [];
     }

     const count = 12; // Generate mock data
     
     for(let i=0; i<count; i++) {
        const branch = uniqueBranches[i % uniqueBranches.length] || 'Cabang Pusat';
        
        // Skip if filtered out (No 'All' option anymore, strict filtering)
        if (branch !== filterBranch) continue;

        if (activeTab === 'staff') {
             // Mock Staff Data
             data.push({
                 id: `stf-${i}`,
                 name: `Staf ${i+1}`,
                 category: 'Staf / TU',
                 branch: branch,
                 stats: {
                    weekly: { h: Math.floor(Math.random() * 5) + 1, i: 0, a: 0 },
                    monthly: { h: Math.floor(Math.random() * 20) + 10, i: 0, a: 0 },
                    semester: { h: Math.floor(Math.random() * 100) + 50, i: Math.floor(Math.random() * 3), a: 0 }
                 }
             });
        } else if (activeTab === 'teacher') {
             // Mock Teacher Data
             data.push({
                 id: `t-${i}`,
                 name: `Ustadz ${i+1}`,
                 category: 'Pengajar',
                 branch: branch,
                 stats: {
                    weekly: { h: Math.floor(Math.random() * 5) + 1, i: 0, a: 0 },
                    monthly: { h: Math.floor(Math.random() * 20) + 10, i: 0, a: 0 },
                    semester: { h: Math.floor(Math.random() * 100) + 50, i: Math.floor(Math.random() * 3), a: 0 }
                 }
             });
        } else {
             // Mock Student Data
             const prog = i % 2 === 0 ? 'Tahfidz' : 'Tahsin';
             if (studentClass === 'tahfidz' && prog !== 'Tahfidz') continue;
             if (studentClass === 'tahsin' && prog !== 'Tahsin') continue;

             data.push({
                 id: `s-${i}`,
                 name: `Santri ${i+1}`,
                 category: prog,
                 branch: branch,
                 stats: {
                    weekly: { h: Math.floor(Math.random() * 5) + 1, i: 0, a: 0 },
                    monthly: { h: Math.floor(Math.random() * 20) + 10, i: Math.floor(Math.random() * 2), a: 0 },
                    semester: { h: Math.floor(Math.random() * 100) + 50, i: Math.floor(Math.random() * 5), a: Math.floor(Math.random() * 2) }
                 }
             });
        }
     }
     return data;

  }, [currentUser, activeTab, studentClass, filterBranch, uniqueBranches]);

  // Calculate Aggregates
  const stats = useMemo(() => {
    if (currentData.length === 0) return { weekly: {h:0, i:0, a:0}, monthly: {h:0, i:0, a:0}, semester: {h:0, i:0, a:0} };
    
    // Average stats for the top cards
    const sum = (key: 'weekly' | 'monthly' | 'semester', field: 'h'|'i'|'a') => 
        Math.round(currentData.reduce((acc, curr) => acc + curr.stats[key][field], 0) / currentData.length);

    return {
        weekly: { h: sum('weekly','h'), i: sum('weekly','i'), a: sum('weekly','a') },
        monthly: { h: sum('monthly','h'), i: sum('monthly','i'), a: sum('monthly','a') },
        semester: { h: sum('semester','h'), i: sum('semester','i'), a: sum('semester','a') }
    };
  }, [currentData]);
  
  const saveTarget = () => {
    onUpdateSettings({ ...settings, attendanceTarget: tempTarget });
    setIsEditingTarget(false);
  };

  return (
    <div className="space-y-8 pb-10">
      
      {/* Top Controls & Admin Settings */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
        
        {currentUser.role !== Role.GUARDIAN ? (
          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto items-center">
              <div className="flex bg-slate-100 p-1 rounded-xl">
                <button 
                  onClick={() => setActiveTab('student')}
                  className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'student' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Data Santri
                </button>
                <button 
                  onClick={() => setActiveTab('teacher')}
                  className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'teacher' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Data Pengajar
                </button>
                {(currentUser.role === Role.ADMIN || currentUser.role === Role.STAFF) && (
                  <button 
                    onClick={() => setActiveTab('staff')}
                    className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'staff' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Data Staf
                  </button>
                )}
              </div>

              {/* ADMIN FILTER BRANCH (No All option) */}
              {(currentUser.role === Role.ADMIN || currentUser.role === Role.STAFF) && (
                <select 
                  value={filterBranch} 
                  onChange={(e) => setFilterBranch(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:border-emerald-500 w-full sm:w-auto"
                >
                  {uniqueBranches.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              )}
          </div>
        ) : (
          <div className="bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100 text-emerald-700 font-bold text-sm">
             Data Absensi Ananda
          </div>
        )}

        {activeTab === 'student' && currentUser.role !== Role.GUARDIAN && (
          <div className="flex gap-2">
             <button onClick={() => setStudentClass('tahfidz')} className={`px-4 py-1.5 rounded-full text-xs font-bold border ${studentClass === 'tahfidz' ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-white border-slate-200 text-slate-500'}`}>Kelas Tahfidz</button>
             <button onClick={() => setStudentClass('tahsin')} className={`px-4 py-1.5 rounded-full text-xs font-bold border ${studentClass === 'tahsin' ? 'bg-sky-50 border-sky-500 text-sky-700' : 'bg-white border-slate-200 text-slate-500'}`}>Kelas Tahsin</button>
          </div>
        )}

        {/* Admin Only Target Setting */}
        {currentUser.role === Role.ADMIN && (
          <div className="flex items-center gap-2">
             {isEditingTarget ? (
               <div className="flex items-center gap-2 animate-fade-in">
                  <input 
                    type="number" 
                    value={tempTarget} 
                    onChange={(e) => setTempTarget(Number(e.target.value))}
                    className="w-20 px-2 py-1 text-sm border border-emerald-300 rounded-lg outline-none focus:ring-2 focus:ring-emerald-200"
                  />
                  <button onClick={saveTarget} className="p-1 bg-emerald-500 text-white rounded-md hover:bg-emerald-600">OK</button>
                  <button onClick={() => setIsEditingTarget(false)} className="p-1 bg-slate-200 text-slate-600 rounded-md hover:bg-slate-300">X</button>
               </div>
             ) : (
               <button 
                 onClick={() => setIsEditingTarget(true)}
                 className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 text-white text-xs rounded-lg hover:bg-slate-700 transition-colors"
               >
                 <span>Target: {settings.attendanceTarget}</span>
               </button>
             )}
          </div>
        )}
      </div>

      {/* Summary Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[
          { title: 'Rekap Pekan Ini', data: stats.weekly },
          { title: 'Rekap Bulan Ini', data: stats.monthly },
          { title: 'Rekap Semester', data: stats.semester },
        ].map((card, idx) => (
           <div key={idx} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex flex-col justify-between">
              <div className="flex justify-between items-start mb-4">
                 <h4 className="font-bold text-slate-700">{card.title}</h4>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center">
                 <div className="bg-emerald-50 p-2 rounded-lg border border-emerald-100">
                    <p className="text-xs text-emerald-600 font-bold uppercase">Hadir</p>
                    <p className="text-lg font-bold text-emerald-700">{card.data?.h || 0}</p>
                 </div>
                 <div className="bg-blue-50 p-2 rounded-lg border border-blue-100">
                    <p className="text-xs text-blue-600 font-bold uppercase">Izin</p>
                    <p className="text-lg font-bold text-blue-700">{card.data?.i || 0}</p>
                 </div>
                 <div className="bg-red-50 p-2 rounded-lg border border-red-100">
                    <p className="text-xs text-red-600 font-bold uppercase">Alpha</p>
                    <p className="text-lg font-bold text-red-700">{card.data?.a || 0}</p>
                 </div>
              </div>
           </div>
        ))}
      </div>

      {/* Detailed Cards List */}
      <div>
        <h3 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          Detail Kehadiran & Progres Semester
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <AnimatePresence mode="popLayout">
            {currentData.length === 0 ? (
                <div className="col-span-full py-10 text-center text-slate-400 bg-white rounded-2xl border border-dashed border-slate-200">
                    Tidak ada data ditemukan.
                </div>
            ) : (
                currentData.map((item) => {
                const totalSemester = item.stats.semester.h;
                const percent = Math.min(100, Math.round((totalSemester / settings.attendanceTarget) * 100));
                
                return (
                    <motion.div
                    key={`${item.id}-${activeTab}`}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    onClick={() => setSelectedItem(item)}
                    className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-lg hover:border-emerald-200 transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between group"
                    >
                    <div>
                        <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-lg font-bold text-slate-500 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors">
                            {item.name.charAt(0)}
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-800 line-clamp-1 text-sm">{item.name}</h4>
                                <p className="text-xs text-slate-400">{item.id === 'child1' ? 'Putra Anda' : `${item.category} • ${item.branch}`}</p>
                            </div>
                        </div>
                        </div>

                        <div className="mt-4 mb-2">
                        <div className="flex justify-between text-xs mb-1 font-semibold text-slate-600">
                            <span>Progres Kehadiran</span>
                            <span>{percent}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                            <div 
                                className={`h-2.5 rounded-full transition-all duration-1000 ${percent >= 80 ? 'bg-emerald-500' : percent >= 50 ? 'bg-yellow-400' : 'bg-red-500'}`} 
                                style={{ width: `${percent}%` }}
                            ></div>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1 text-right">Target: {settings.attendanceTarget} Pertemuan</p>
                        </div>
                    </div>

                    <div className="pt-3 border-t border-slate-50 mt-2 grid grid-cols-3 gap-1 text-center text-xs">
                        <div>
                            <span className="block text-slate-400">Hadir</span>
                            <span className="font-bold text-emerald-600">{item.stats.semester.h}</span>
                        </div>
                        <div>
                            <span className="block text-slate-400">Izin</span>
                            <span className="font-bold text-blue-600">{item.stats.semester.i}</span>
                        </div>
                        <div>
                            <span className="block text-slate-400">Alpha</span>
                            <span className="font-bold text-red-600">{item.stats.semester.a}</span>
                        </div>
                    </div>
                    </motion.div>
                );
                })
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Charts Section */}
      <div className="pt-8 border-t border-slate-200">
        <h3 className="text-xl font-bold text-slate-800 mb-6 text-center">Analisis Grafik Global</h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           {/* Simple Pie Chart */}
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h4 className="text-sm font-bold text-slate-600 mb-4 text-center">Komposisi Kehadiran Semester</h4>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Hadir', value: stats.semester.h },
                        { name: 'Izin', value: stats.semester.i },
                        { name: 'Alpha', value: stats.semester.a }
                      ]}
                      cx="50%" cy="50%"
                      innerRadius={50} outerRadius={70}
                      paddingAngle={5} dataKey="value"
                    >
                      <Cell fill={COLORS.Hadir} />
                      <Cell fill={COLORS.Izin} />
                      <Cell fill={COLORS.Alpha} />
                    </Pie>
                    <Tooltip contentStyle={{borderRadius: '8px', border: 'none'}} />
                    <Legend verticalAlign="bottom" height={36}/>
                  </PieChart>
                </ResponsiveContainer>
              </div>
           </div>

           {/* Simple Area Chart */}
           <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <h4 className="text-sm font-bold text-slate-600 mb-4 text-center">Tren Kehadiran Bulanan</h4>
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={[
                     {name: 'B1', h: stats.monthly.h - 5},
                     {name: 'B2', h: stats.monthly.h - 2},
                     {name: 'B3', h: stats.monthly.h},
                     {name: 'B4', h: stats.monthly.h + 2},
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{borderRadius: '8px', border: 'none'}} />
                    <Area type="monotone" dataKey="h" stroke={COLORS.Hadir} fill={COLORS.Hadir} fillOpacity={0.2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
           </div>
        </div>
      </div>

      {/* DETAIL MODAL POPUP */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               className="absolute inset-0 bg-black/40 backdrop-blur-sm"
               onClick={() => setSelectedItem(null)}
             />
             <motion.div 
               initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }}
               className="bg-white rounded-3xl w-full max-w-2xl relative z-10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
             >
                {/* Header Modal */}
                <div className="bg-gradient-to-r from-emerald-500 to-teal-500 p-6 text-white relative">
                   <button onClick={() => setSelectedItem(null)} className="absolute top-4 right-4 text-white/70 hover:text-white bg-white/20 hover:bg-white/30 rounded-full p-1 transition-colors">
                     ✕
                   </button>
                   <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-3xl font-bold text-emerald-600 shadow-lg">
                        {selectedItem.name.charAt(0)}
                      </div>
                      <div>
                         <h3 className="text-2xl font-bold">{selectedItem.name}</h3>
                         <p className="text-emerald-100 opacity-90">{selectedItem.category}</p>
                      </div>
                   </div>
                   <div className="mt-6 flex gap-4 text-center">
                      <div className="bg-white/20 rounded-xl p-2 flex-1 backdrop-blur-sm">
                         <p className="text-xs uppercase opacity-70">Total Hadir</p>
                         <p className="text-xl font-bold">{selectedItem.stats.semester.h}</p>
                      </div>
                      <div className="bg-white/20 rounded-xl p-2 flex-1 backdrop-blur-sm">
                         <p className="text-xs uppercase opacity-70">Total Izin</p>
                         <p className="text-xl font-bold">{selectedItem.stats.semester.i}</p>
                      </div>
                      <div className="bg-white/20 rounded-xl p-2 flex-1 backdrop-blur-sm">
                         <p className="text-xs uppercase opacity-70">Total Alpha</p>
                         <p className="text-xl font-bold">{selectedItem.stats.semester.a}</p>
                      </div>
                   </div>
                </div>

                {/* Content Modal */}
                <div className="p-6 overflow-y-auto">
                   <h4 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                      Grafik Perkembangan Kehadiran
                   </h4>
                   
                   <div className="h-64 w-full bg-slate-50 rounded-2xl p-4 border border-slate-100 mb-6">
                      <ResponsiveContainer width="100%" height="100%">
                         <AreaChart data={generateTrendData()}>
                            <defs>
                               <linearGradient id="colorHadir" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                               </linearGradient>
                            </defs>
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#64748b'}} />
                            <YAxis hide />
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <Tooltip contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                            <Area type="monotone" dataKey="hadir" stroke="#10b981" fillOpacity={1} fill="url(#colorHadir)" strokeWidth={3} />
                         </AreaChart>
                      </ResponsiveContainer>
                   </div>

                   <h4 className="font-bold text-slate-800 mb-3">Catatan Kedisiplinan</h4>
                   <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800">
                      <p className="font-bold mb-1">Catatan HRD / Kepala Sekolah:</p>
                      <p>Secara umum kehadiran sangat baik. Tingkatkan terus kedisiplinan dan kinerja.</p>
                   </div>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};