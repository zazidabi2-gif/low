import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Student, Role } from '../types';

interface InputExamProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: User;
  students: Student[];
  onSave: (data: Record<string, any>) => void;
  existingResults: Record<string, any>;
  onUpdateStudent?: (id: string, data: Partial<Student>) => void;
  readOnly?: boolean; // New Prop for Admin/Staff View Mode
}

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

// Interface for Promotion Options
interface PromotionOption {
  label: string;
  grade: string;
  description: string;
  targetProgram?: 'Tahfidz' | 'Tahsin'; // Optional program switch
}

export const InputExam: React.FC<InputExamProps> = ({ isOpen, onClose, currentUser, students, onSave, existingResults, onUpdateStudent, readOnly = false }) => {
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  
  // Filters
  const [filterBranch, setFilterBranch] = useState<string>('All');
  const [filterProgram, setFilterProgram] = useState<string>('All');
  const [filterGrade, setFilterGrade] = useState<string>('All');

  // Promotion State
  const [promotionStatus, setPromotionStatus] = useState<'CONTINUE' | 'REPEAT' | null>(null);
  const [nextLevelData, setNextLevelData] = useState<{ grade: string, program?: string } | null>(null);
  const [showLevelSelectionModal, setShowLevelSelectionModal] = useState(false);

  // Local form state
  const [formData, setFormData] = useState<Record<string, any>>(() => {
    return JSON.parse(JSON.stringify(existingResults));
  });

  const uniqueBranches = useMemo(() => Array.from(new Set(students.map(s => s.branch))), [students]);
  const uniqueGrades = useMemo(() => {
    let filtered = students;
    if (filterProgram !== 'All') {
        filtered = filtered.filter(s => s.program === filterProgram);
    }
    return Array.from(new Set(filtered.map(s => s.grade))).sort();
  }, [students, filterProgram]);

  const scoreOptions = useMemo(() => {
    const options = [];
    for (let i = 100; i >= 60; i -= 5) {
      options.push(i);
    }
    return options;
  }, []);

  const getPerception = (avg: number) => {
    if (avg === 0) return "-";
    if (avg >= 90) return "Sangat Baik";
    if (avg >= 80) return "Baik";
    if (avg >= 70) return "Cukup";
    return "Kurang";
  };

  const getPerceptionColor = (avg: number) => {
    if (avg === 0) return "text-slate-400";
    if (avg >= 90) return "text-emerald-400";
    if (avg >= 80) return "text-blue-400";
    if (avg >= 70) return "text-yellow-400";
    return "text-red-400";
  };

  // Filter Logic - Respect ReadOnly context if needed, but mainly filter by dropdowns
  const filteredStudents = useMemo(() => {
    let data = students;
    
    // Strict Teacher filter if not admin/staff
    if (currentUser.role === Role.TEACHER) {
         data = data.filter(s => s.teacherId === currentUser.id);
    }

    return data.filter(s => {
      if (filterBranch !== 'All' && s.branch !== filterBranch) return false;
      if (filterProgram !== 'All' && s.program !== filterProgram) return false;
      if (filterGrade !== 'All' && s.grade !== filterGrade) return false;
      return true;
    });
  }, [students, filterBranch, filterProgram, filterGrade, currentUser]);

  const getAvailableExamTypes = (student: Student): ExamType[] => {
    return (Object.keys(EXAM_CRITERIA) as ExamType[]).filter(key => {
        if (student.program === 'Tahfidz') return key === 'TAHFIDZ';
        if (student.program === 'Tahsin') return key.startsWith('TAHSIN');
        return false;
    });
  };

  // --- LOGIC PERCABANGAN LEVEL (UPDATED: Removed Jilid) ---
  const getNextLevelOptions = (currentExamType: ExamType): PromotionOption[] => {
    if (currentExamType === 'TAHSIN_1') {
        return [
            { label: 'Naik ke Level 2', grade: 'Level 2', description: 'Lanjut ke materi Tahsin Level 2' }
        ];
    }
    if (currentExamType === 'TAHSIN_2') {
        return [
            { label: 'Naik ke Level 3', grade: 'Level 3', description: 'Lanjut ke materi Tajwid & Gharib (Level 3)' }
        ];
    }
    if (currentExamType === 'TAHSIN_3') {
        return [
            { label: 'Lulus ke Tahfidz', grade: 'Juz 30', targetProgram: 'Tahfidz', description: 'Wisuda Tahsin & Masuk Tahfidz' }
        ];
    }
    return [];
  };

  const handleOpenStudentModal = (student: Student) => {
    const defaultType = student.program === 'Tahfidz' ? 'TAHFIDZ' : 'TAHSIN_1';

    if (!formData[student.id]) {
        setFormData(prev => ({
            ...prev,
            [student.id]: {
                studentId: student.id,
                type: defaultType,
                scores: {},
                notes: '',
                average: 0
            }
        }));
    }
    
    setPromotionStatus(null);
    setNextLevelData(null);
    setShowLevelSelectionModal(false);
    
    setSelectedStudent(student);
  };

  const handleTypeChange = (studentId: string, newType: ExamType) => {
    if (readOnly) return;
    setFormData(prev => ({
        ...prev,
        [studentId]: {
            ...prev[studentId],
            type: newType,
            scores: {}
        }
    }));
    setPromotionStatus(null);
    setNextLevelData(null);
  };

  const handleScoreChange = (studentId: string, field: string, value: string) => {
    if (readOnly) return;
    const numVal = Number(value);
    
    setFormData(prev => {
        const currentData = prev[studentId] || {};
        const newScores = { ...(currentData.scores || {}), [field]: numVal };
        
        const type = currentData.type as ExamType;
        const fields = EXAM_CRITERIA[type]?.fields || [];
        let avg = 0;
        if (fields.length > 0) {
             const total = fields.reduce((sum: number, f: string) => sum + (newScores[f] || 0), 0);
             avg = Number((total / fields.length).toFixed(1));
        }

        if (avg < 70) {
            setPromotionStatus(null);
            setNextLevelData(null);
        }

        return {
            ...prev,
            [studentId]: {
                ...currentData,
                scores: newScores,
                average: avg,
                date: new Date().toISOString()
            }
        };
    });
  };

  const handleNoteChange = (studentId: string, value: string) => {
    if (readOnly) return;
    setFormData(prev => ({
        ...prev,
        [studentId]: { ...prev[studentId], notes: value }
    }));
  };

  const selectNextLevel = (option: PromotionOption) => {
      if (readOnly) return;
      setNextLevelData({ grade: option.grade, program: option.targetProgram });
      setPromotionStatus('CONTINUE');
      setShowLevelSelectionModal(false);
  };

  const handleSubmit = () => {
    if (readOnly) {
        onClose();
        return;
    }
    onSave(formData);
    
    if (selectedStudent && selectedStudent.program === 'Tahsin' && promotionStatus === 'CONTINUE' && nextLevelData && onUpdateStudent) {
       const updates: Partial<Student> = { grade: nextLevelData.grade };
       if (nextLevelData.program) {
           updates.program = nextLevelData.program as 'Tahfidz' | 'Tahsin';
       }
       onUpdateStudent(selectedStudent.id, updates);
       
       let message = `Data tersimpan. Santri naik ke ${nextLevelData.grade}`;
       if (nextLevelData.program) message += ` dan pindah program ke ${nextLevelData.program}`;
       alert(message);
    } else {
       alert('Data Nilai Ujian berhasil disimpan.');
    }

    onClose();
  };

  if (!isOpen) return null;

  const activeData = selectedStudent ? formData[selectedStudent.id] : null;
  const activeType = (activeData?.type || (selectedStudent?.program === 'Tahfidz' ? 'TAHFIDZ' : 'TAHSIN_1')) as ExamType;
  const availableExamTypes = selectedStudent ? getAvailableExamTypes(selectedStudent) : [];
  const currentAverage = activeData?.average || 0;
  
  // Logic to show promotion: Must be Tahsin AND Score >= 70 (Cukup)
  const canPromote = selectedStudent?.program === 'Tahsin' && currentAverage >= 70;
  const nextOptions = getNextLevelOptions(activeType);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-sans">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      {/* MAIN MODAL */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-slate-100 rounded-3xl w-full max-w-5xl relative z-10 shadow-2xl overflow-hidden flex flex-col h-[85vh]"
      >
        {/* Header & Filters */}
        <div className="bg-white p-6 shadow-sm z-20">
          <div className="flex justify-between items-center mb-4">
            <div>
                <h3 className="text-2xl font-bold text-slate-800">
                    {readOnly ? 'Detail Nilai Ujian (View Only)' : 'Input Nilai Ujian'}
                </h3>
                <p className="text-slate-500 text-sm">
                    {readOnly ? 'Lihat hasil ujian santri.' : 'Pilih santri untuk memasukkan nilai.'}
                </p>
            </div>
            <button onClick={onClose} className="bg-slate-100 hover:bg-slate-200 p-2 rounded-full transition-colors text-slate-500 font-bold w-10 h-10">✕</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <select 
                value={filterBranch}
                onChange={(e) => setFilterBranch(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="All">Semua Cabang</option>
                {uniqueBranches.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
              <select 
                value={filterProgram}
                onChange={(e) => setFilterProgram(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="All">Semua Program</option>
                <option value="Tahfidz">Tahfidz</option>
                <option value="Tahsin">Tahsin</option>
              </select>
              <select 
                value={filterGrade}
                onChange={(e) => setFilterGrade(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="All">Semua Tingkat</option>
                {uniqueGrades.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
          </div>
        </div>

        {/* List of Students */}
        <div className="flex-1 overflow-y-auto p-6">
          {filteredStudents.length === 0 ? (
             <div className="h-full flex flex-col items-center justify-center text-slate-400">
                <p className="text-lg font-medium">Tidak ada santri yang sesuai filter.</p>
             </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredStudents.map((student) => {
                const data = formData[student.id];
                const isFilled = data && data.average > 0;
                
                return (
                  <motion.div 
                    key={student.id}
                    whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                    onClick={() => handleOpenStudentModal(student)}
                    className={`relative bg-white p-5 rounded-2xl border cursor-pointer transition-all flex flex-col gap-3 group ${isFilled ? 'border-emerald-200' : 'border-slate-200'}`}
                  >
                    <div className="absolute top-3 right-3">
                        {isFilled ? (
                            <span className="bg-emerald-100 text-emerald-700 text-[10px] font-bold px-2 py-1 rounded-full border border-emerald-200">Selesai</span>
                        ) : (
                            <span className="bg-slate-100 text-slate-500 text-[10px] font-bold px-2 py-1 rounded-full border border-slate-200 group-hover:bg-slate-200">
                                {readOnly ? 'Belum Ada Data' : 'Belum Dinilai'}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-lg shadow-md ${student.program === 'Tahfidz' ? 'bg-gradient-to-br from-emerald-400 to-teal-500' : 'bg-gradient-to-br from-sky-400 to-blue-500'}`}>
                           {student.name.charAt(0)}
                        </div>
                        <div>
                           <h4 className="font-bold text-slate-700 text-sm line-clamp-1">{student.name}</h4>
                           <p className="text-xs text-slate-500">{student.grade}</p>
                        </div>
                    </div>
                    <div className="mt-auto pt-3 border-t border-slate-50 flex justify-between items-center">
                        <span className="text-xs text-slate-400 font-medium">{student.branch}</span>
                        {isFilled ? (
                            <div className="text-right">
                                <span className="block text-xs font-bold text-emerald-600">{data.average}</span>
                                <span className="text-[10px] text-slate-400">{getPerception(data.average)}</span>
                            </div>
                        ) : (
                            <span className="text-xs text-slate-300 group-hover:text-emerald-500 font-bold transition-colors">
                                {readOnly ? 'Lihat Detail →' : 'Input Nilai →'}
                            </span>
                        )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Main Modal Footer */}
        <div className="p-4 bg-white border-t border-slate-100 flex justify-end gap-3 z-20">
            <button onClick={onClose} className="px-5 py-2 rounded-xl text-slate-500 font-bold hover:bg-slate-100 transition-colors">Tutup</button>
            {!readOnly && (
                <button onClick={handleSubmit} className="px-6 py-2 rounded-xl bg-slate-800 text-white font-bold hover:bg-slate-700 shadow-lg shadow-slate-500/30 transition-colors">Simpan Semua Data</button>
            )}
        </div>

        {/* SUB-MODAL: Grading Form */}
        <AnimatePresence>
            {selectedStudent && (
                <div className="absolute inset-0 z-50 flex items-center justify-center p-4">
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
                        onClick={() => setSelectedStudent(null)}
                    />
                    
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }} 
                        animate={{ opacity: 1, scale: 1 }} 
                        exit={{ opacity: 0, scale: 0.9 }}
                        className="bg-white rounded-3xl w-full max-w-2xl relative z-50 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
                    >
                         {/* Form Header */}
                         <div className={`p-6 text-white flex justify-between items-center ${selectedStudent.program === 'Tahfidz' ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gradient-to-r from-sky-500 to-blue-500'}`}>
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center font-bold text-2xl shadow-inner">
                                    {selectedStudent.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold">{selectedStudent.name}</h3>
                                    <p className="opacity-90 text-sm">{selectedStudent.program} • {selectedStudent.grade}</p>
                                </div>
                            </div>
                            <button onClick={() => setSelectedStudent(null)} className="bg-white/20 hover:bg-white/30 w-8 h-8 rounded-full flex items-center justify-center transition-colors">✕</button>
                         </div>

                         {/* Form Content */}
                         <div className="p-6 overflow-y-auto bg-slate-50 flex-1 relative">
                            {readOnly && (
                                <div className="mb-4 bg-yellow-50 border border-yellow-100 text-yellow-700 px-4 py-2 rounded-lg text-sm font-bold text-center">
                                    Mode Lihat Saja (Read Only)
                                </div>
                            )}

                            {/* Exam Type Tabs */}
                            <div className="mb-6">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Kategori Ujian</label>
                                <div className="flex flex-wrap gap-2">
                                    {availableExamTypes.map(type => (
                                        <button
                                            key={type}
                                            disabled={readOnly}
                                            onClick={() => handleTypeChange(selectedStudent.id, type)}
                                            className={`px-4 py-2 rounded-lg text-xs font-bold border transition-all ${
                                                activeType === type 
                                                ? 'bg-slate-800 text-white border-slate-900 shadow-md transform scale-105' 
                                                : 'bg-white text-slate-500 border-slate-200 ' + (readOnly ? 'opacity-70 cursor-not-allowed' : 'hover:bg-slate-100')
                                            }`}
                                        >
                                            {EXAM_CRITERIA[type].label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Score Inputs */}
                            <div className="space-y-3 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                                {EXAM_CRITERIA[activeType].fields.map((field, idx) => (
                                    <div key={idx} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
                                        <label className="text-sm font-semibold text-slate-700 w-1/2">{field}</label>
                                        <div className="flex items-center gap-2">
                                            <select 
                                                disabled={readOnly}
                                                value={activeData?.scores?.[field] || ''}
                                                onChange={(e) => handleScoreChange(selectedStudent.id, field, e.target.value)}
                                                className={`w-24 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-800 outline-none transition-all text-center appearance-none ${readOnly ? 'cursor-not-allowed opacity-80' : 'focus:ring-2 focus:ring-emerald-500'}`}
                                            >
                                                <option value="0">-</option>
                                                {scoreOptions.map(score => (
                                                    <option key={score} value={score}>{score}</option>
                                                ))}
                                            </select>
                                            <span className="text-xs text-slate-300 font-bold w-6">/100</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Notes Field */}
                            <div className="mt-4">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Keterangan / Catatan</label>
                                <textarea
                                    disabled={readOnly}
                                    value={activeData?.notes || ''}
                                    onChange={(e) => handleNoteChange(selectedStudent.id, e.target.value)}
                                    placeholder={readOnly ? "Tidak ada catatan" : "Tuliskan catatan evaluasi untuk santri ini..."}
                                    rows={3}
                                    className={`w-full px-4 py-3 rounded-xl bg-white border border-slate-200 outline-none text-sm ${readOnly ? 'cursor-not-allowed text-slate-500' : 'focus:ring-2 focus:ring-emerald-500'}`}
                                ></textarea>
                            </div>

                            {/* SPECIAL: TAHSIN PROMOTION LOGIC (Only Show if NOT ReadOnly OR if already Promoted) */}
                            {/* In ReadOnly mode, we might want to see the decision, but not change it. For now, hiding controls in readOnly. */}
                            {!readOnly && canPromote && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-6 bg-gradient-to-br from-sky-50 to-blue-50 border border-sky-100 rounded-2xl p-5 shadow-sm"
                                >
                                    <h4 className="text-sm font-bold text-sky-800 mb-4 flex items-center gap-2">
                                        <span className="text-lg">🎓</span> Keputusan Hasil Ujian
                                    </h4>
                                    
                                    <div className="grid grid-cols-2 gap-4">
                                        <button 
                                            onClick={() => {
                                                setPromotionStatus('REPEAT');
                                                setNextLevelData(null);
                                            }}
                                            className={`p-4 rounded-xl border-2 text-sm font-bold transition-all flex flex-col items-center gap-1 ${promotionStatus === 'REPEAT' ? 'border-yellow-400 bg-yellow-50 text-yellow-700 shadow-md transform scale-105' : 'border-white bg-white text-slate-500 hover:bg-slate-50'}`}
                                        >
                                            <span className="text-lg">↺</span>
                                            <span>Tetap di Level Ini</span>
                                        </button>
                                        
                                        <button 
                                            onClick={() => setShowLevelSelectionModal(true)}
                                            className={`p-4 rounded-xl border-2 text-sm font-bold transition-all flex flex-col items-center gap-1 relative ${promotionStatus === 'CONTINUE' ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-md' : 'border-white bg-white text-emerald-600 hover:bg-emerald-50'}`}
                                        >
                                            {promotionStatus === 'CONTINUE' && <div className="absolute top-2 right-2 text-emerald-500">✓</div>}
                                            <span className="text-lg">🚀</span>
                                            <span>
                                                {promotionStatus === 'CONTINUE' && nextLevelData 
                                                    ? `Lanjut ke: ${nextLevelData.grade}` 
                                                    : 'Lanjut Tingkat'}
                                            </span>
                                        </button>
                                    </div>
                                    
                                    {/* INFO SELECTED LEVEL */}
                                    {promotionStatus === 'CONTINUE' && nextLevelData && (
                                        <div className="mt-3 text-center">
                                            <span className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full font-bold">
                                                Santri akan dipromosikan ke: {nextLevelData.grade} 
                                                {nextLevelData.program ? ` (${nextLevelData.program})` : ''}
                                            </span>
                                        </div>
                                    )}
                                </motion.div>
                            )}

                            {/* Average Result with Perception */}
                            <div className="mt-6 flex justify-between items-center bg-slate-800 p-4 rounded-xl shadow-lg text-white">
                                <div>
                                    <p className="text-xs opacity-70 uppercase font-bold tracking-wider">Nilai Akhir</p>
                                    <p className={`text-lg font-bold mt-1 ${getPerceptionColor(activeData?.average || 0)}`}>
                                        {getPerception(activeData?.average || 0)}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-4xl font-bold text-emerald-400">
                                        {activeData?.average || 0}
                                    </p>
                                </div>
                            </div>
                         </div>

                         {/* Form Footer */}
                         <div className="p-4 bg-white border-t border-slate-100 flex justify-end">
                            {!readOnly ? (
                                <button onClick={() => setSelectedStudent(null)} className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition-all">
                                    Selesai & Simpan
                                </button>
                            ) : (
                                <button onClick={() => setSelectedStudent(null)} className="w-full py-3 bg-slate-800 text-white rounded-xl font-bold shadow-lg transition-all">
                                    Tutup
                                </button>
                            )}
                         </div>
                    </motion.div>
                    
                    {/* LEVEL SELECTION POP-UP (NESTED MODAL) */}
                    <AnimatePresence>
                        {showLevelSelectionModal && !readOnly && (
                            <div className="absolute inset-0 z-[60] flex items-center justify-center p-6">
                                <motion.div 
                                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                    className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                                    onClick={() => setShowLevelSelectionModal(false)}
                                />
                                <motion.div
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.8, opacity: 0 }}
                                    className="bg-white rounded-3xl p-6 shadow-2xl relative z-10 w-full max-w-sm border-2 border-emerald-100"
                                >
                                    <h4 className="text-xl font-bold text-slate-800 text-center mb-1">Pilih Tingkat Selanjutnya</h4>
                                    <p className="text-slate-500 text-xs text-center mb-6">Tentukan jenjang lanjutan untuk santri ini</p>
                                    
                                    <div className="space-y-3">
                                        {nextOptions.map((opt, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => selectNextLevel(opt)}
                                                className="w-full p-4 rounded-xl border-2 border-slate-100 hover:border-emerald-500 hover:bg-emerald-50 transition-all group text-left"
                                            >
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="font-bold text-slate-800 group-hover:text-emerald-700">{opt.label}</span>
                                                    {opt.targetProgram === 'Tahfidz' && <span className="text-[10px] bg-sky-100 text-sky-700 px-2 py-0.5 rounded font-bold">Pindah Program</span>}
                                                </div>
                                                <div className="text-xs text-slate-500">{opt.description}</div>
                                            </button>
                                        ))}
                                    </div>
                                    
                                    <button 
                                        onClick={() => setShowLevelSelectionModal(false)}
                                        className="mt-6 w-full py-2 text-slate-400 font-bold text-sm hover:text-slate-600"
                                    >
                                        Batal
                                    </button>
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            )}
        </AnimatePresence>

      </motion.div>
    </div>
  );
};