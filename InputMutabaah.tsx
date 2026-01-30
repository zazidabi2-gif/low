import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Student, Role } from '../types';

interface InputMutabaahProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  students: Student[];
}

export const InputMutabaah: React.FC<InputMutabaahProps> = ({ isOpen, onClose, currentUser, students }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [expandedStudentId, setExpandedStudentId] = useState<string | null>(null);
  
  // Store form data by student ID
  const [formData, setFormData] = useState<Record<string, any>>({});

  // Strict Filter: Only show students belonging to this teacher
  const myStudents = students.filter(s => s.teacherId === currentUser.id);

  // Generators for Dropdowns
  const pageNumbers = Array.from({ length: 120 }, (_, i) => i + 1);
  const grades = Array.from({ length: 10 }, (_, i) => i + 1);

  const handleInputChange = (studentId: string, field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value
      }
    }));
  };

  const toggleExpand = (id: string) => {
    setExpandedStudentId(expandedStudentId === id ? null : id);
  };

  const handleSubmit = () => {
    console.log("Submitting Mutabaah:", { date, data: formData });
    alert(`Data Mu'taba'ah berhasil disimpan untuk ${Object.keys(formData).length} santri.`);
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
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white">
          <div className="flex justify-between items-center mb-1">
            <h3 className="text-2xl font-bold">Input Mu'taba'ah</h3>
            <button onClick={onClose} className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors text-white">✕</button>
          </div>
          <p className="text-emerald-100 text-sm">Catat perkembangan hafalan dan kualitas bacaan santri.</p>
        </div>

        {/* Date Picker */}
        <div className="px-6 pt-6 pb-2 bg-white border-b border-slate-100">
          <div className="flex items-center gap-4">
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
        </div>

        {/* Student List */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50 space-y-3">
          {myStudents.length === 0 ? (
             <div className="text-center py-10 text-slate-400">Tidak ada santri yang terhubung.</div>
          ) : (
            myStudents.map((student) => {
              const data = formData[student.id] || {};
              const isFilled = Object.keys(data).length > 0;

              return (
                <div key={student.id} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition-all">
                  {/* Header Row */}
                  <div 
                    onClick={() => toggleExpand(student.id)}
                    className={`p-4 flex items-center justify-between cursor-pointer ${expandedStudentId === student.id ? 'bg-emerald-50/50' : ''}`}
                  >
                    <div className="flex items-center gap-3">
                       <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white text-sm ${student.program === 'Tahfidz' ? 'bg-emerald-500' : 'bg-sky-500'}`}>
                          {student.name.charAt(0)}
                       </div>
                       <div>
                         <h4 className="font-bold text-slate-700">{student.name}</h4>
                         <p className="text-xs text-slate-500 flex items-center gap-1">
                           <span className={`w-2 h-2 rounded-full ${student.program === 'Tahfidz' ? 'bg-emerald-500' : 'bg-sky-500'}`}></span>
                           {student.program} • {student.grade}
                         </p>
                       </div>
                    </div>
                    <div className="flex items-center gap-2">
                       {isFilled && <span className="text-xs bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded border border-emerald-200">Tersimpan</span>}
                       <span className="text-slate-300 font-bold text-xs">Buka</span>
                    </div>
                  </div>

                  {/* Expandable Form */}
                  <AnimatePresence>
                    {expandedStudentId === student.id && (
                      <motion.div 
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="bg-slate-50 border-t border-slate-100 p-5"
                      >
                        {student.program === 'Tahsin' ? (
                          /* --- FORM TAHSIN --- */
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                                <label className="text-xs font-bold text-slate-500 block mb-1">Muroja'ah Halaman</label>
                                <div className="flex gap-2">
                                  <select 
                                    className="w-full text-sm p-2 bg-slate-50 rounded border outline-none"
                                    value={data.murojaahPage || ''}
                                    onChange={(e) => handleInputChange(student.id, 'murojaahPage', e.target.value)}
                                  >
                                    <option value="">Hal</option>
                                    {pageNumbers.map(n => <option key={n} value={n}>{n}</option>)}
                                  </select>
                                  <select 
                                    className="w-20 text-sm p-2 bg-slate-50 rounded border outline-none"
                                    value={data.murojaahGrade || ''}
                                    onChange={(e) => handleInputChange(student.id, 'murojaahGrade', e.target.value)}
                                  >
                                    <option value="">Nilai</option>
                                    {grades.map(n => <option key={n} value={n}>{n}</option>)}
                                  </select>
                                </div>
                              </div>
                              <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                                <label className="text-xs font-bold text-slate-500 block mb-1">Klasikal Halaman</label>
                                <select 
                                  className="w-full text-sm p-2 bg-slate-50 rounded border outline-none"
                                  value={data.klasikalPage || ''}
                                  onChange={(e) => handleInputChange(student.id, 'klasikalPage', e.target.value)}
                                >
                                  <option value="">Pilih Halaman</option>
                                  {pageNumbers.map(n => <option key={n} value={n}>{n}</option>)}
                                </select>
                              </div>
                            </div>

                            <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                                <label className="text-xs font-bold text-slate-500 block mb-1">Ziyadah</label>
                                <div className="flex gap-2">
                                  <select 
                                    className="w-full text-sm p-2 bg-slate-50 rounded border outline-none"
                                    value={data.ziyadahPage || ''}
                                    onChange={(e) => handleInputChange(student.id, 'ziyadahPage', e.target.value)}
                                  >
                                    <option value="">Pilih Halaman</option>
                                    {pageNumbers.map(n => <option key={n} value={n}>{n}</option>)}
                                  </select>
                                  <select 
                                    className="w-20 text-sm p-2 bg-slate-50 rounded border outline-none"
                                    value={data.ziyadahGrade || ''}
                                    onChange={(e) => handleInputChange(student.id, 'ziyadahGrade', e.target.value)}
                                  >
                                    <option value="">Nilai</option>
                                    {grades.map(n => <option key={n} value={n}>{n}</option>)}
                                  </select>
                                </div>
                            </div>

                            <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                              <label className="text-xs font-bold text-slate-500 block mb-1">Hafalan Surat Pendek</label>
                              <div className="flex flex-col gap-2">
                                <div className="flex gap-2">
                                  <input 
                                    type="text" 
                                    placeholder="Nama Surat..." 
                                    className="w-full text-sm p-2 bg-slate-50 rounded border outline-none"
                                    value={data.hafalanSurah || ''}
                                    onChange={(e) => handleInputChange(student.id, 'hafalanSurah', e.target.value)}
                                  />
                                  <select 
                                    className="w-20 text-sm p-2 bg-slate-50 rounded border outline-none"
                                    value={data.hafalanGrade || ''}
                                    onChange={(e) => handleInputChange(student.id, 'hafalanGrade', e.target.value)}
                                  >
                                    <option value="">Nilai</option>
                                    {grades.map(n => <option key={n} value={n}>{n}</option>)}
                                  </select>
                                </div>
                                <input 
                                  type="text" 
                                  placeholder="Keterangan / Catatan..." 
                                  className="w-full text-sm p-2 bg-slate-50 rounded border outline-none"
                                  value={data.notes || ''}
                                  onChange={(e) => handleInputChange(student.id, 'notes', e.target.value)}
                                />
                              </div>
                            </div>
                          </div>
                        ) : (
                          /* --- FORM TAHFIDZ --- */
                          <div className="space-y-3">
                            <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                               <label className="text-xs font-bold text-slate-500 block mb-1">Hafalan Ziyadah</label>
                               <input 
                                  type="text" 
                                  placeholder="Juz, Halaman, atau Ayat..." 
                                  className="w-full text-sm p-2 bg-slate-50 rounded border outline-none"
                                  value={data.ziyadah || ''}
                                  onChange={(e) => handleInputChange(student.id, 'ziyadah', e.target.value)}
                               />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                                <label className="text-xs font-bold text-slate-500 block mb-1">Muroja'ah Individu</label>
                                <input 
                                    type="text" 
                                    placeholder="Cth: Juz 29 Hal 1-5" 
                                    className="w-full text-sm p-2 bg-slate-50 rounded border outline-none"
                                    value={data.murojaahIndividu || ''}
                                    onChange={(e) => handleInputChange(student.id, 'murojaahIndividu', e.target.value)}
                                />
                              </div>
                              <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                                <label className="text-xs font-bold text-slate-500 block mb-1">Muroja'ah Klasikal</label>
                                <input 
                                    type="text" 
                                    placeholder="Cth: QS Al-Mulk" 
                                    className="w-full text-sm p-2 bg-slate-50 rounded border outline-none"
                                    value={data.murojaahKlasikal || ''}
                                    onChange={(e) => handleInputChange(student.id, 'murojaahKlasikal', e.target.value)}
                                />
                              </div>
                            </div>
                            <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                               <label className="text-xs font-bold text-slate-500 block mb-1">Materi Tajwid & Keterangan</label>
                               <div className="space-y-2">
                                  <input 
                                    type="text" 
                                    placeholder="Materi Tajwid (jika ada)..." 
                                    className="w-full text-sm p-2 bg-slate-50 rounded border outline-none"
                                    value={data.tajwid || ''}
                                    onChange={(e) => handleInputChange(student.id, 'tajwid', e.target.value)}
                                  />
                                  <textarea 
                                    placeholder="Keterangan tambahan..." 
                                    rows={2}
                                    className="w-full text-sm p-2 bg-slate-50 rounded border outline-none"
                                    value={data.notes || ''}
                                    onChange={(e) => handleInputChange(student.id, 'notes', e.target.value)}
                                  />
                               </div>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-white flex justify-end gap-3">
          <button onClick={onClose} className="px-5 py-2 rounded-xl text-slate-500 font-bold hover:bg-slate-100 transition-colors">Batal</button>
          <button onClick={handleSubmit} className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-500/30 transition-colors">Simpan Semua</button>
        </div>
      </motion.div>
    </div>
  );
};