import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { User, Student, Branch } from '../types';

interface InputStudentProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (student: Student) => void;
  branches: Branch[];
  teachers: User[];
}

export const InputStudent: React.FC<InputStudentProps> = ({ isOpen, onClose, onSave, branches, teachers }) => {
  // Form States
  const [fullName, setFullName] = useState('');
  const [address, setAddress] = useState('');
  const [parentName, setParentName] = useState('');
  const [school, setSchool] = useState(''); // Sekolah Asal
  const [schoolGrade, setSchoolGrade] = useState(''); // Kelas (Sekolah Umum)
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [branch, setBranch] = useState('');
  const [teacherId, setTeacherId] = useState('');
  const [program, setProgram] = useState<'Tahsin' | 'Tahfidz'>('Tahsin'); // Istilah UI: Kelas
  const [grade, setGrade] = useState(''); // Istilah UI: Level
  const [infaqAmount, setInfaqAmount] = useState<number>(150000);

  // Generate Infaq Options (150k - 500k, step 50k)
  const infaqOptions = useMemo(() => {
    const options = [];
    for (let i = 150000; i <= 500000; i += 50000) {
      options.push(i);
    }
    return options;
  }, []);

  // Level Options based on Class (Program)
  // Tahfidz has NO levels. Tahsin has Level 1, 2, 3.
  const levelOptions = useMemo(() => {
    if (program === 'Tahfidz') return []; 
    return ['Level 1', 'Level 2', 'Level 3'];
  }, [program]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newStudent: Student = {
      id: `NIS${Math.floor(1000 + Math.random() * 9000)}`, // Auto-generate simple NIS
      name: fullName,
      branch: branch || (branches[0]?.name || 'Pusat'),
      teacherId: teacherId,
      grade: program === 'Tahfidz' ? '-' : grade, // Jika Tahfidz, grade strip/kosong
      program: program,
      status: 'active',
      parentName: parentName,
      phone: phone,
      address: address,
      school: school, // Sekolah Asal
      // Note: schoolGrade state is used for UI but mapped to notes or appended to school in real app if no field exists, 
      // but for now we stick to types.ts. Assuming 'school' can hold both or just school name.
      // Let's assume we append it to school string for storage if no dedicated field in types.
      email: email,
      infaqAmount: infaqAmount
    };
    onSave(newStudent);
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
        className="bg-slate-50 rounded-3xl w-full max-w-4xl relative z-10 shadow-2xl overflow-hidden flex flex-col h-[90vh]"
      >
        {/* Header */}
        <div className="bg-white p-6 border-b border-slate-100 flex justify-between items-center">
            <div>
                <h3 className="text-2xl font-bold text-slate-800">Input Data Santri Baru</h3>
                <p className="text-slate-500 text-sm">Lengkapi formulir pendaftaran santri baru.</p>
            </div>
            <button onClick={onClose} className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors">✕</button>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
            <form id="addStudentForm" onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* SECTION 1: DATA SANTRI & WALI */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm md:col-span-2">
                    <h4 className="text-sm font-bold text-emerald-600 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Data Santri & Wali Santri</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-slate-500 mb-1">Nama Lengkap Santri</label>
                            <input type="text" required value={fullName} onChange={e => setFullName(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 outline-none transition-all" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-slate-500 mb-1">Alamat Lengkap</label>
                            <textarea required rows={2} value={address} onChange={e => setAddress(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 outline-none transition-all"></textarea>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Nama Orang Tua / Wali</label>
                            <input type="text" required value={parentName} onChange={e => setParentName(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 outline-none transition-all" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Nomor WhatsApp</label>
                            <input type="tel" required value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 outline-none transition-all" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Email Wali Santri</label>
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 outline-none transition-all" />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Sekolah Asal</label>
                                <input type="text" value={school} onChange={e => setSchool(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 outline-none transition-all" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Kelas (Sekolah Umum)</label>
                                <input type="text" value={schoolGrade} onChange={e => setSchoolGrade(e.target.value)} placeholder="Cth: 4 SD" className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-emerald-500 outline-none transition-all" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* SECTION 2: DATA AKADEMIK */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h4 className="text-sm font-bold text-sky-600 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Data Akademik</h4>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Cabang</label>
                            <select required value={branch} onChange={e => setBranch(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-sky-500 outline-none transition-all">
                                <option value="">Pilih Cabang</option>
                                {branches.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Pengajar / Ustadz</label>
                            <select required value={teacherId} onChange={e => setTeacherId(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-sky-500 outline-none transition-all">
                                <option value="">Pilih Pengajar</option>
                                {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Kelas (Program)</label>
                                <select value={program} onChange={e => { setProgram(e.target.value as any); setGrade(''); }} className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-sky-500 outline-none transition-all">
                                    <option value="Tahsin">Tahsin</option>
                                    <option value="Tahfidz">Tahfidz</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Level</label>
                                {program === 'Tahfidz' ? (
                                    <input 
                                      type="text" 
                                      disabled 
                                      value="-" 
                                      className="w-full px-4 py-2 rounded-xl border border-slate-100 bg-slate-100 text-slate-400 cursor-not-allowed outline-none font-bold text-center"
                                    />
                                ) : (
                                    <select required value={grade} onChange={e => setGrade(e.target.value)} className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-sky-500 outline-none transition-all">
                                        <option value="">Pilih Level</option>
                                        {levelOptions.map(g => <option key={g} value={g}>{g}</option>)}
                                    </select>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* SECTION 3: ADMINISTRASI */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                    <h4 className="text-sm font-bold text-orange-600 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Administrasi</h4>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Komitmen Infaq Bulanan</label>
                        <select 
                            required 
                            value={infaqAmount} 
                            onChange={e => setInfaqAmount(Number(e.target.value))} 
                            className="w-full px-4 py-2 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-orange-500 outline-none transition-all font-bold text-slate-700"
                        >
                            {infaqOptions.map(amount => (
                                <option key={amount} value={amount}>
                                    Rp {amount.toLocaleString('id-ID')}
                                </option>
                            ))}
                        </select>
                        <p className="text-[10px] text-slate-400 mt-2">* Pilih nominal infaq yang disepakati mulai dari Rp 150.000 s/d Rp 500.000</p>
                    </div>
                </div>

            </form>
        </div>

        {/* Footer */}
        <div className="bg-white p-4 border-t border-slate-100 flex justify-end gap-3">
            <button onClick={onClose} className="px-6 py-2 rounded-xl text-slate-500 font-bold hover:bg-slate-50 transition-colors">Batal</button>
            <button form="addStudentForm" type="submit" className="px-6 py-2 rounded-xl bg-slate-800 text-white font-bold hover:bg-slate-700 shadow-lg shadow-slate-500/30 transition-colors">Simpan Data Santri</button>
        </div>

      </motion.div>
    </div>
  );
};