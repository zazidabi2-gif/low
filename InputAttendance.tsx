import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Student, Role } from '../types';

interface InputAttendanceProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  students: Student[];
}

type AttendanceStatus = 'present' | 'sick' | 'permission' | 'alpha' | null;

export const InputAttendance: React.FC<InputAttendanceProps> = ({ isOpen, onClose, currentUser, students }) => {
  // If user is Staff, default to 'teacher' tab (Employee attendance)
  const [activeTab, setActiveTab] = useState<'student' | 'teacher'>(
      currentUser.role === Role.STAFF ? 'teacher' : 'student'
  );
  
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [expandedStudentId, setExpandedStudentId] = useState<string | null>(null);

  // State for Student Attendance Data
  const [studentAttendance, setStudentAttendance] = useState<Record<string, { status: AttendanceStatus; note: string }>>({});
  
  // State for Teacher/Staff Attendance Data
  const [teacherStatus, setTeacherStatus] = useState<AttendanceStatus>(null);
  const [teacherNote, setTeacherNote] = useState('');

  // Strict Filter: Only show students belonging to this teacher
  const myStudents = students.filter(s => s.teacherId === currentUser.id);

  const toggleStudentExpand = (id: string) => {
    setExpandedStudentId(expandedStudentId === id ? null : id);
  };

  const updateStudentStatus = (id: string, status: AttendanceStatus) => {
    setStudentAttendance(prev => ({
      ...prev,
      [id]: { ...prev[id], status }
    }));
  };

  const updateStudentNote = (id: string, note: string) => {
    setStudentAttendance(prev => ({
      ...prev,
      [id]: { ...prev[id], note }
    }));
  };

  const handleSubmit = () => {
    // Simulation of API Call
    console.log("Date:", date);
    if (activeTab === 'student') {
      console.log("Submitting Student Attendance:", studentAttendance);
      alert(`Berhasil menyimpan data absensi untuk ${Object.keys(studentAttendance).length} santri.`);
    } else {
      console.log("Submitting Employee Attendance:", { status: teacherStatus, note: teacherNote });
      alert("Absensi Anda berhasil disimpan.");
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-sans">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
        onClick={onClose}
      />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-3xl w-full max-w-2xl relative z-10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="bg-white border-b border-slate-100 p-6 pb-2">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-bold text-slate-800">Input Absensi</h3>
            <button onClick={onClose} className="p-2 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 transition-colors font-bold w-10 h-10">Tutup</button>
          </div>

          {/* Date Picker & Info */}
          <div className="flex items-center gap-4 mb-6">
             <input 
               type="date" 
               value={date} 
               onChange={(e) => setDate(e.target.value)}
               className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
             />
             <div className="text-sm text-slate-500">
               <p>{new Date(date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
             </div>
          </div>

          {/* Custom Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-xl">
             {/* HIDE STUDENT TAB IF USER IS STAFF */}
             {currentUser.role !== Role.STAFF && (
               <button 
                 onClick={() => setActiveTab('student')}
                 className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'student' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
               >
                 Absensi Santri
               </button>
             )}
             
             <button 
               onClick={() => setActiveTab('teacher')}
               className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeTab === 'teacher' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
             >
               {currentUser.role === Role.STAFF ? 'Absensi Staf' : 'Absensi Pengajar'}
             </button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
          
          <AnimatePresence mode="wait">
            {activeTab === 'student' ? (
              <motion.div 
                key="student-list"
                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                className="space-y-3"
              >
                {myStudents.length === 0 ? (
                   <div className="text-center py-10 text-slate-400">
                      <p>Tidak ada data santri yang terhubung dengan akun Anda.</p>
                   </div>
                ) : (
                  myStudents.map((student) => {
                    const status = studentAttendance[student.id]?.status;
                    return (
                      <div key={student.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden transition-all shadow-sm hover:shadow-md">
                        {/* List Item Header (Clickable) */}
                        <div 
                          onClick={() => toggleStudentExpand(student.id)}
                          className={`p-4 flex items-center justify-between cursor-pointer ${expandedStudentId === student.id ? 'bg-emerald-50/50' : 'bg-white'}`}
                        >
                          <div className="flex items-center gap-3">
                             <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm ${status === 'present' ? 'bg-emerald-500' : status === 'sick' ? 'bg-yellow-400' : status === 'permission' ? 'bg-blue-500' : status === 'alpha' ? 'bg-red-500' : 'bg-slate-300'}`}>
                                {student.name.charAt(0)}
                             </div>
                             <div>
                               <h4 className="font-bold text-slate-700">{student.name}</h4>
                               <p className="text-xs text-slate-500">{student.grade} • {student.branch}</p>
                             </div>
                          </div>
                          <div className="flex items-center gap-2">
                             {status && (
                               <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                                 status === 'present' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                                 status === 'sick' ? 'bg-yellow-100 text-yellow-700 border-yellow-200' :
                                 status === 'permission' ? 'bg-blue-100 text-blue-700 border-blue-200' :
                                 'bg-red-100 text-red-700 border-red-200'
                               }`}>
                                 {status === 'present' ? 'Hadir' : status === 'sick' ? 'Sakit' : status === 'permission' ? 'Izin' : 'Alpha'}
                               </span>
                             )}
                             <span className="text-slate-300 transform transition-transform duration-300 text-xs font-bold">
                               {expandedStudentId === student.id ? 'Tutup' : 'Buka'}
                             </span>
                          </div>
                        </div>

                        {/* Expandable Options */}
                        <AnimatePresence>
                          {expandedStudentId === student.id && (
                            <motion.div 
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="bg-slate-50 border-t border-slate-100"
                            >
                              <div className="p-4 space-y-4">
                                 <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Status Kehadiran</label>
                                    <div className="grid grid-cols-4 gap-2">
                                       <button onClick={() => updateStudentStatus(student.id, 'present')} className={`py-2 rounded-lg text-sm font-bold border transition-colors ${status === 'present' ? 'bg-emerald-500 text-white border-emerald-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-emerald-50'}`}>Hadir</button>
                                       <button onClick={() => updateStudentStatus(student.id, 'permission')} className={`py-2 rounded-lg text-sm font-bold border transition-colors ${status === 'permission' ? 'bg-blue-500 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-blue-50'}`}>Izin</button>
                                       <button onClick={() => updateStudentStatus(student.id, 'sick')} className={`py-2 rounded-lg text-sm font-bold border transition-colors ${status === 'sick' ? 'bg-yellow-400 text-white border-yellow-500' : 'bg-white text-slate-600 border-slate-200 hover:bg-yellow-50'}`}>Sakit</button>
                                       <button onClick={() => updateStudentStatus(student.id, 'alpha')} className={`py-2 rounded-lg text-sm font-bold border transition-colors ${status === 'alpha' ? 'bg-red-500 text-white border-red-600' : 'bg-white text-slate-600 border-slate-200 hover:bg-red-50'}`}>Alpha</button>
                                    </div>
                                 </div>
                                 <div>
                                    <input 
                                      type="text" 
                                      placeholder="Catatan khusus (opsional)..."
                                      value={studentAttendance[student.id]?.note || ''}
                                      onChange={(e) => updateStudentNote(student.id, e.target.value)}
                                      className="w-full px-4 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:border-emerald-500 outline-none"
                                    />
                                 </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    );
                  })
                )}
              </motion.div>
            ) : (
              <motion.div 
                key="teacher-form"
                initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm"
              >
                 <div className="flex items-center gap-4 mb-6 pb-6 border-b border-slate-100">
                    <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-3xl font-bold text-emerald-600">
                        {currentUser.name.charAt(0)}
                    </div>
                    <div>
                       <h3 className="text-xl font-bold text-slate-800">{currentUser.name}</h3>
                       <p className="text-slate-500 text-sm">NIP/ID: {currentUser.id}</p>
                    </div>
                 </div>

                 <div className="space-y-6">
                    <div>
                       <label className="text-sm font-bold text-slate-700 mb-3 block">Status Kehadiran Anda</label>
                       <div className="grid grid-cols-2 gap-4">
                          <button 
                            onClick={() => setTeacherStatus('present')}
                            className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${teacherStatus === 'present' ? 'border-emerald-500 bg-emerald-50 text-emerald-700' : 'border-slate-200 hover:border-emerald-200 text-slate-500'}`}
                          >
                             <span className="font-bold">Hadir {currentUser.role === Role.STAFF ? 'Bekerja' : 'Mengajar'}</span>
                          </button>
                          <button 
                             onClick={() => setTeacherStatus('permission')}
                             className={`p-4 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${teacherStatus === 'permission' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 hover:border-blue-200 text-slate-500'}`}
                          >
                             <span className="font-bold">Izin / Sakit</span>
                          </button>
                       </div>
                    </div>

                    <div>
                       <label className="text-sm font-bold text-slate-700 mb-2 block">Keterangan / Jurnal Harian</label>
                       <textarea 
                         rows={4}
                         value={teacherNote}
                         onChange={(e) => setTeacherNote(e.target.value)}
                         placeholder={currentUser.role === Role.STAFF ? "Tuliskan laporan singkat pekerjaan hari ini..." : "Tuliskan materi yang diajarkan hari ini atau alasan izin..."}
                         className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                       ></textarea>
                    </div>
                 </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-white flex justify-end gap-3">
           <button onClick={onClose} className="px-6 py-2.5 rounded-xl text-slate-500 font-bold hover:bg-slate-100 transition-colors">Batal</button>
           <button onClick={handleSubmit} className="px-6 py-2.5 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 shadow-lg shadow-emerald-500/30 transition-colors">
              Simpan Data
           </button>
        </div>
      </motion.div>
    </div>
  );
};