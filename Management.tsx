import React, { useState, useMemo, useEffect } from 'react';
import { User, Student, Role, Branch } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend 
} from 'recharts';

interface DataListProps {
  type: 'student' | 'staff' | 'branch';
  data: any[];
  canEdit: boolean;
  onEdit?: (id: string, newData: any) => void;
  onAdd?: (newData: any) => void;
  teachers?: User[]; // Passed only when type is student
}

interface ConfirmationState {
  isOpen: boolean;
  action: 'edit' | 'delete' | null;
  itemId: string | null;
  itemName: string;
}

export const DataList: React.FC<DataListProps> = ({ type, data, canEdit, onEdit, onAdd, teachers }) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  
  // Student Modal & Edit States
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isEditingStudent, setIsEditingStudent] = useState(false);
  const [editFormData, setEditFormData] = useState<Partial<Student>>({});

  // --- HIERARCHICAL FILTERS (For Student View) ---
  const [activeBranch, setActiveBranch] = useState<string | null>(null);
  const [activeTeacherId, setActiveTeacherId] = useState<string | null>(null);
  const [activeClass, setActiveClass] = useState<'Tahfidz' | 'Tahsin'>('Tahfidz');
  const [statusFilter, setStatusFilter] = useState<'active' | 'inactive'>('active');

  const [confirm, setConfirm] = useState<ConfirmationState>({ 
    isOpen: false, action: null, itemId: null, itemName: '' 
  });

  const uniqueBranches = useMemo(() => Array.from(new Set((data as Student[]).map(s => s.branch))), [data]);
  
  // Initialize Defaults
  useEffect(() => {
    if (type === 'student' && uniqueBranches.length > 0 && !activeBranch) {
      setActiveBranch(uniqueBranches[0]);
    }
  }, [type, uniqueBranches]);

  // Derived Teachers List based on Active Branch
  const visibleTeachers = useMemo(() => {
    if (!activeBranch) return [];
    // Get distinct teacher IDs from students in this branch
    const teacherIdsInBranch = Array.from(new Set(
       (data as Student[])
         .filter(s => s.branch === activeBranch)
         .map(s => s.teacherId)
    ));

    // Map to User objects
    return teacherIdsInBranch.map(tid => {
       const user = teachers?.find(t => t.id === tid);
       return user || { id: tid, name: `Ustadz ${tid}` }; // Fallback
    });
  }, [activeBranch, data, teachers]);

  // Set default teacher when branch changes
  useEffect(() => {
    if (visibleTeachers.length > 0) {
       // Reset teacher selection when branch changes, default to first
       setActiveTeacherId(prev => visibleTeachers.find(t => t.id === prev) ? prev : visibleTeachers[0].id);
    } else {
       setActiveTeacherId(null);
    }
  }, [activeBranch, visibleTeachers]);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const getTitle = () => {
    switch (type) {
      case 'student': return 'Data Santri';
      case 'staff': return 'Data Pengajar & Staf';
      case 'branch': return 'Data Cabang';
      default: return 'Data';
    }
  };

  const getIconColor = () => {
    switch (type) {
      case 'student': return 'bg-gradient-to-br from-blue-400 to-indigo-500';
      case 'staff': return 'bg-gradient-to-br from-emerald-400 to-teal-500';
      case 'branch': return 'bg-gradient-to-br from-violet-400 to-purple-500';
      default: return 'bg-slate-400';
    }
  };

  // --- FILTER LOGIC (Student Only) ---
  const filteredData = useMemo(() => {
    if (type !== 'student') return data;
    
    // Strict Hierarchical Filtering
    if (!activeBranch || !activeTeacherId) return [];

    return data.filter((item) => {
      const s = item as Student;
      return (
        s.branch === activeBranch &&
        s.teacherId === activeTeacherId &&
        s.program === activeClass &&
        s.status === statusFilter
      );
    });
  }, [type, data, activeBranch, activeTeacherId, activeClass, statusFilter]);

  // --- CHART DATA (Global/Summary based on all data to maintain context) ---
  const chartData = useMemo(() => {
    if (type !== 'student') return { branch: [], class: [], status: [] };

    const branchCount: Record<string, number> = {};
    const classCount = { Tahsin: 0, Tahfidz: 0 };
    const statusCount = { Active: 0, Inactive: 0 };

    (data as Student[]).forEach(s => {
       branchCount[s.branch] = (branchCount[s.branch] || 0) + 1;
       if (s.program === 'Tahsin') classCount.Tahsin++;
       else if (s.program === 'Tahfidz') classCount.Tahfidz++;
       
       if (s.status === 'active') statusCount.Active++;
       else statusCount.Inactive++;
    });

    return {
       branch: Object.keys(branchCount).map(k => ({ name: k, count: branchCount[k] })),
       class: [
         { name: 'Tahsin', value: classCount.Tahsin }, 
         { name: 'Tahfidz', value: classCount.Tahfidz }
       ],
       status: [
         { name: 'Aktif', value: statusCount.Active },
         { name: 'Non-Aktif', value: statusCount.Inactive }
       ]
    };
  }, [data, type]);

  // --- Handlers ---
  const handleConfirm = () => {
    if (confirm.action === 'delete') {
      alert(`Berhasil menghapus data: ${confirm.itemName}`);
    } else if (confirm.action === 'edit') {
      if (onEdit && confirm.itemId) onEdit(confirm.itemId, {});
      else alert("Fitur edit akan membuka formulir perubahan data.");
    }
    setConfirm({ isOpen: false, action: null, itemId: null, itemName: '' });
  };

  const handleStudentClick = (student: Student) => {
    setSelectedStudent(student);
    setIsEditingStudent(false);
    setEditFormData(student);
  };

  const handleEditChange = (field: keyof Student, value: any) => {
    setEditFormData(prev => ({ ...prev, [field]: value }));
    if (field === 'program' && value === 'Tahfidz') {
      setEditFormData(prev => ({ ...prev, grade: '-' }));
    }
  };

  const saveStudentEdit = () => {
     if (onEdit && selectedStudent) {
        onEdit(selectedStudent.id, editFormData);
        alert("Data santri berhasil diperbarui.");
        setSelectedStudent(null);
        setIsEditingStudent(false);
     }
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-2">
        <h2 className="text-2xl font-bold text-slate-800">{getTitle()}</h2>
        
        {/* Status Toggle (Right Side) */}
        {type === 'student' && (
          <div className="flex bg-white rounded-lg p-1 border border-slate-200 shadow-sm">
             <button 
               onClick={() => setStatusFilter('active')}
               className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${statusFilter === 'active' ? 'bg-emerald-500 text-white shadow' : 'text-slate-500 hover:bg-slate-50'}`}
             >
               Aktif
             </button>
             <button 
               onClick={() => setStatusFilter('inactive')}
               className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${statusFilter === 'inactive' ? 'bg-red-500 text-white shadow' : 'text-slate-500 hover:bg-slate-50'}`}
             >
               Non-Aktif
             </button>
          </div>
        )}
      </div>

      {/* --- STUDENT VIEW: HIERARCHICAL TABS --- */}
      {type === 'student' ? (
        <div className="space-y-6">
            
            {/* LEVEL 1: BRANCH TABS */}
            <div className="overflow-x-auto pb-2 custom-scrollbar">
               <div className="flex gap-3 min-w-max">
                 {uniqueBranches.map(branch => (
                    <button
                      key={branch}
                      onClick={() => setActiveBranch(branch)}
                      className={`px-5 py-3 rounded-2xl font-bold text-sm transition-all border ${
                         activeBranch === branch 
                         ? 'bg-slate-800 text-white border-slate-900 shadow-lg shadow-slate-500/20 transform scale-105' 
                         : 'bg-white text-slate-500 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      {branch}
                    </button>
                 ))}
               </div>
            </div>

            {/* LEVEL 2 & 3 CONTAINER */}
            <AnimatePresence mode="wait">
              {activeBranch && (
                 <motion.div 
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   exit={{ opacity: 0, y: -10 }}
                   className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-6"
                 >
                    {/* Level 2: Teachers */}
                    <div>
                       <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Pilih Pengajar (Ustadz)</h4>
                       <div className="flex flex-wrap gap-2">
                          {visibleTeachers.length > 0 ? (
                             visibleTeachers.map((t: any) => (
                                <button
                                   key={t.id}
                                   onClick={() => setActiveTeacherId(t.id)}
                                   className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                                      activeTeacherId === t.id
                                      ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm'
                                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-white hover:border-slate-300'
                                   }`}
                                >
                                   {t.name}
                                </button>
                             ))
                          ) : (
                             <p className="text-sm text-slate-400 italic">Belum ada pengajar di cabang ini.</p>
                          )}
                       </div>
                    </div>

                    {/* Level 3: Class */}
                    {activeTeacherId && (
                       <div>
                          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Pilih Kelas</h4>
                          <div className="flex gap-4">
                             <button
                               onClick={() => setActiveClass('Tahfidz')}
                               className={`flex-1 py-3 rounded-xl border-2 font-bold text-sm transition-all flex flex-col items-center justify-center gap-1 ${
                                  activeClass === 'Tahfidz'
                                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                  : 'border-slate-100 text-slate-400 hover:bg-slate-50 hover:text-slate-600'
                               }`}
                             >
                                <span className="text-lg">📖</span>
                                <span>Kelas Tahfidz</span>
                             </button>
                             <button
                               onClick={() => setActiveClass('Tahsin')}
                               className={`flex-1 py-3 rounded-xl border-2 font-bold text-sm transition-all flex flex-col items-center justify-center gap-1 ${
                                  activeClass === 'Tahsin'
                                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                                  : 'border-slate-100 text-slate-400 hover:bg-slate-50 hover:text-slate-600'
                               }`}
                             >
                                <span className="text-lg">🗣️</span>
                                <span>Kelas Tahsin</span>
                             </button>
                          </div>
                       </div>
                    )}
                 </motion.div>
              )}
            </AnimatePresence>

            {/* RESULTS GRID */}
            <AnimatePresence mode="wait">
               <motion.div
                  key={`${activeBranch}-${activeTeacherId}-${activeClass}-${statusFilter}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
               >
                 {filteredData.length === 0 ? (
                    <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200">
                       <p className="text-slate-400 font-medium">Tidak ada data santri untuk filter ini.</p>
                    </div>
                 ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredData.map((item) => {
                            const student = item as Student;
                            const isTahfidz = student.program === 'Tahfidz';
                            return (
                            <motion.div
                                key={student.id}
                                layout
                                onClick={() => handleStudentClick(student)}
                                whileHover={{ y: -5, boxShadow: "0 15px 30px rgba(0,0,0,0.1)" }}
                                className="relative bg-white rounded-3xl overflow-hidden cursor-pointer group border border-slate-100 shadow-sm transition-all duration-300"
                            >
                                <div className={`h-24 w-full absolute top-0 left-0 bg-gradient-to-r ${isTahfidz ? 'from-emerald-500 to-teal-500' : 'from-blue-500 to-indigo-500'} opacity-10 group-hover:opacity-20 transition-opacity`}></div>
                                
                                <div className="absolute top-4 right-4 flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${student.status === 'active' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]' : 'bg-slate-400'}`}></div>
                                </div>

                                <div className="p-6 pt-8 flex flex-col items-center relative z-10">
                                    <div className={`w-20 h-20 rounded-2xl rotate-3 flex items-center justify-center text-3xl font-bold text-white shadow-lg mb-4 transform transition-transform group-hover:rotate-0 group-hover:scale-105 ${isTahfidz ? 'bg-gradient-to-br from-emerald-400 to-teal-600' : 'bg-gradient-to-br from-blue-400 to-indigo-600'}`}>
                                        {student.name.charAt(0)}
                                    </div>
                                    <h3 className="font-bold text-slate-800 text-lg text-center leading-tight mb-1 line-clamp-2">{student.name}</h3>
                                    <p className="text-xs text-slate-400 font-mono mb-4">{student.id}</p>
                                </div>

                                <div className="bg-slate-50/50 p-4 border-t border-slate-100 flex justify-between items-center text-xs">
                                    <div className="flex flex-col">
                                        <span className="text-slate-400 font-semibold">Ustadz</span>
                                        <span className="font-bold text-slate-700 truncate w-24">Ust. {student.teacherId}</span>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-slate-400 font-semibold">Level</span>
                                        <span className="font-bold text-slate-700">{student.grade === '-' ? 'Reguler' : student.grade}</span>
                                    </div>
                                </div>
                            </motion.div>
                            );
                        })}
                    </div>
                 )}
               </motion.div>
            </AnimatePresence>

            {/* --- GLOBAL CHARTS SECTION --- */}
            <div className="pt-8 border-t border-slate-200">
                <h3 className="text-xl font-bold text-slate-800 mb-6 text-center">Analisis Data Global</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
                        <h4 className="text-sm font-bold text-slate-600 mb-4 text-center">Jumlah Santri per Cabang</h4>
                        <div className="h-48">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData.branch}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10}} />
                                    <Tooltip contentStyle={{borderRadius: '12px', border: 'none'}} />
                                    <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={30} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
                        <h4 className="text-sm font-bold text-slate-600 mb-4 text-center">Komposisi Kelas</h4>
                        <div className="h-48">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={chartData.class} cx="50%" cy="50%" innerRadius={40} outerRadius={60} paddingAngle={5} dataKey="value">
                                        <Cell fill="#10b981" /> 
                                        <Cell fill="#3b82f6" /> 
                                    </Pie>
                                    <Tooltip contentStyle={{borderRadius: '12px', border: 'none'}} />
                                    <Legend verticalAlign="bottom" height={20} iconType="circle"/>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
                        <h4 className="text-sm font-bold text-slate-600 mb-4 text-center">Status Keaktifan (1 Tahun)</h4>
                        <div className="h-48">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={chartData.status} cx="50%" cy="50%" startAngle={180} endAngle={0} innerRadius={40} outerRadius={70} paddingAngle={5} dataKey="value">
                                        <Cell fill="#10b981" /> 
                                        <Cell fill="#ef4444" />
                                    </Pie>
                                    <Tooltip contentStyle={{borderRadius: '12px', border: 'none'}} />
                                    <Legend verticalAlign="bottom" height={20} iconType="circle"/>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      ) : (
        /* --- OTHER VIEWS: LIST (Unchanged) --- */
        <div className="grid grid-cols-1 gap-4">
          {filteredData.map((item) => (
            <motion.div 
              key={item.id}
              layout
              className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden"
            >
              <div 
                className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                onClick={() => toggleExpand(item.id)}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${getIconColor()}`}>
                    {type === 'branch' ? 'C' : item.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800">{item.name}</h3>
                    <p className="text-sm text-slate-500">
                      {type === 'staff' ? `${item.role} • ${item.branch || 'Pusat'}` : `${item.address}`}
                    </p>
                  </div>
                </div>
                <div className="text-slate-400 font-bold text-xs">
                  {expandedId === item.id ? 'Tutup' : 'Buka'}
                </div>
              </div>

              <AnimatePresence>
                {expandedId === item.id && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="bg-slate-50 border-t border-slate-100 px-6 py-4"
                  >
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-slate-600">
                       {type === 'staff' && (
                         <>
                          <p><span className="font-medium text-slate-800">Username:</span> {(item as User).username || '-'}</p>
                          <p><span className="font-medium text-slate-800">Email:</span> {(item as User).email || '-'}</p>
                          <p><span className="font-medium text-slate-800">Status:</span> {(item as User).isActive ? 'Aktif' : 'Non-Aktif'}</p>
                          <p><span className="font-medium text-slate-800">Telp:</span> {(item as User).phone || '-'}</p>
                         </>
                       )}
                       {type === 'branch' && (
                         <>
                          <p><span className="font-medium text-slate-800">Kode Cabang:</span> {(item as Branch).id}</p>
                          <p><span className="font-medium text-slate-800">Kepala Cabang:</span> {(item as Branch).headName || '-'}</p>
                          <p><span className="font-medium text-slate-800">Telepon:</span> {(item as Branch).phone || '-'}</p>
                          <p><span className="font-medium text-slate-800">Alamat:</span> {(item as Branch).address}</p>
                         </>
                       )}
                     </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}

      {/* --- STUDENT DETAIL / EDIT MODAL --- */}
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
                className="bg-white rounded-3xl w-full max-w-4xl relative z-10 shadow-2xl overflow-hidden flex flex-col max-h-[95vh]"
              >
                 {/* Modal Header */}
                 <div className={`p-6 pb-8 text-white relative ${selectedStudent.program === 'Tahfidz' ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gradient-to-r from-sky-500 to-blue-500'}`}>
                    <div className="flex justify-between items-start relative z-10">
                       <div className="flex items-center gap-5">
                          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-4xl font-bold shadow-lg" style={{color: selectedStudent.program === 'Tahfidz' ? '#10b981' : '#0ea5e9'}}>
                             {selectedStudent.name.charAt(0)}
                          </div>
                          <div>
                             {isEditingStudent ? (
                                <input 
                                  value={editFormData.name}
                                  onChange={(e) => handleEditChange('name', e.target.value)}
                                  className="text-2xl font-bold bg-white/20 text-white border-none rounded px-2 py-1 outline-none placeholder-white/70 w-full"
                                />
                             ) : (
                                <h3 className="text-3xl font-bold">{selectedStudent.name}</h3>
                             )}
                             
                             <div className="flex items-center gap-2 mt-1 opacity-90 text-lg">
                                {isEditingStudent ? (
                                   <>
                                     <select 
                                       value={editFormData.program}
                                       onChange={(e) => handleEditChange('program', e.target.value)}
                                       className="bg-white/20 text-white text-sm rounded px-2 py-1 outline-none border-none"
                                     >
                                        <option value="Tahsin" className="text-slate-800">Tahsin</option>
                                        <option value="Tahfidz" className="text-slate-800">Tahfidz</option>
                                     </select>
                                     
                                     {editFormData.program === 'Tahsin' && (
                                       <select 
                                          value={editFormData.grade}
                                          onChange={(e) => handleEditChange('grade', e.target.value)}
                                          className="bg-white/20 text-white text-sm rounded px-2 py-1 outline-none border-none"
                                       >
                                          <option value="Level 1" className="text-slate-800">Level 1</option>
                                          <option value="Level 2" className="text-slate-800">Level 2</option>
                                          <option value="Level 3" className="text-slate-800">Level 3</option>
                                       </select>
                                     )}
                                   </>
                                ) : (
                                   <p>{selectedStudent.grade} • {selectedStudent.branch}</p>
                                )}
                             </div>
                          </div>
                       </div>
                       <button onClick={() => setSelectedStudent(null)} className="w-10 h-10 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors">✕</button>
                    </div>
                 </div>

                 {/* Modal Body */}
                 <div className="flex-1 overflow-y-auto bg-slate-50 p-6 md:p-8">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                        <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-2">
                            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Informasi Detail</h4>
                            {canEdit && !isEditingStudent && (
                                <button onClick={() => setIsEditingStudent(true)} className="text-sm font-bold text-emerald-600 hover:text-emerald-700 hover:underline">
                                    Edit Data
                                </button>
                            )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* FIELDS */}
                            {[
                                { label: 'Nama Wali', field: 'parentName', type: 'text' },
                                { label: 'No. WhatsApp', field: 'phone', type: 'tel' },
                                { label: 'Email', field: 'email', type: 'email' },
                                { label: 'Alamat', field: 'address', type: 'text' },
                                { label: 'Sekolah Asal', field: 'school', type: 'text' },
                                { label: 'Cabang', field: 'branch', type: 'select', options: ['Cabang A', 'Cabang B', 'Cabang Pusat'] }, 
                                { label: 'Status', field: 'status', type: 'select', options: ['inactive'] }, // Modified: Removed 'active' option choice
                            ].map((input, idx) => (
                                <div key={idx} className="flex flex-col">
                                    <label className="text-xs font-bold text-slate-400 mb-1">{input.label}</label>
                                    {isEditingStudent ? (
                                        input.type === 'select' ? (
                                            <select 
                                                value={editFormData[input.field as keyof Student] as string}
                                                onChange={(e) => handleEditChange(input.field as keyof Student, e.target.value)}
                                                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold outline-none focus:border-emerald-500"
                                            >
                                                {/* Special handling for Status: Show Active ONLY if it is the current value, else only show Inactive */}
                                                {(input.field === 'status' && editFormData.status === 'active' 
                                                    ? ['active', ...input.options!] 
                                                    : input.options
                                                )?.map(opt => (
                                                    <option key={opt} value={opt}>
                                                        {opt === 'active' ? 'Aktif' : opt === 'inactive' ? 'Non-Aktif' : opt}
                                                    </option>
                                                ))}
                                            </select>
                                        ) : (
                                            <input 
                                                type={input.type} 
                                                value={editFormData[input.field as keyof Student] as string || ''}
                                                onChange={(e) => handleEditChange(input.field as keyof Student, e.target.value)}
                                                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold outline-none focus:border-emerald-500"
                                            />
                                        )
                                    ) : (
                                        <p className="font-semibold text-slate-800">
                                            {input.field === 'status' 
                                                ? (selectedStudent.status === 'active' ? 'Aktif' : 'Non-Aktif') 
                                                : (selectedStudent[input.field as keyof Student] as string) || '-'}
                                        </p>
                                    )}
                                </div>
                            ))}
                            
                            <div className="flex flex-col">
                                <label className="text-xs font-bold text-slate-400 mb-1">Infaq Bulanan</label>
                                <p className="font-bold text-emerald-600">Rp {(selectedStudent.infaqAmount || 0).toLocaleString('id-ID')}</p>
                            </div>
                        </div>
                    </div>
                 </div>

                 {/* Modal Footer */}
                 <div className="p-4 bg-white border-t border-slate-100 flex justify-end gap-3">
                    {isEditingStudent ? (
                        <>
                            <button onClick={() => { setIsEditingStudent(false); setEditFormData(selectedStudent); }} className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-50 rounded-xl transition-colors text-sm">
                                Batal
                            </button>
                            <button onClick={saveStudentEdit} className="px-6 py-2 bg-emerald-600 text-white font-bold rounded-xl shadow-lg hover:bg-emerald-700 transition-colors text-sm">
                                Simpan Perubahan
                            </button>
                        </>
                    ) : (
                        <button onClick={() => setSelectedStudent(null)} className="px-6 py-2 bg-slate-800 text-white font-bold rounded-xl shadow-lg hover:bg-slate-700 transition-colors">
                            Tutup
                        </button>
                    )}
                 </div>
              </motion.div>
           </div>
        )}
      </AnimatePresence>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {confirm.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setConfirm({ ...confirm, isOpen: false })}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl p-6 w-full max-w-sm relative z-10 shadow-2xl border border-slate-100"
            >
              <h3 className="text-xl font-bold text-slate-800 text-center mb-2">
                {confirm.action === 'delete' ? 'Hapus Data?' : 'Konfirmasi Edit'}
              </h3>
              <div className="flex gap-3 mt-6">
                <button 
                  onClick={() => setConfirm({ ...confirm, isOpen: false })}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors"
                >
                  Batal
                </button>
                <button 
                  onClick={handleConfirm}
                  className={`flex-1 px-4 py-2.5 rounded-xl text-white font-bold text-sm shadow-lg transition-colors ${
                    confirm.action === 'delete' 
                      ? 'bg-red-500 hover:bg-red-600 shadow-red-500/30' 
                      : 'bg-yellow-500 hover:bg-yellow-600 shadow-yellow-500/30'
                  }`}
                >
                  {confirm.action === 'delete' ? 'Ya, Hapus' : 'Ya, Lanjutkan'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};