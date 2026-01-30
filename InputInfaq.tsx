import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Student, Transaction } from '../types';

interface InputInfaqProps {
  isOpen: boolean;
  onClose: () => void;
  students: Student[];
  transactions: Transaction[];
  onSave: (transaction: Transaction) => void;
}

export const InputInfaq: React.FC<InputInfaqProps> = ({ isOpen, onClose, students, transactions, onSave }) => {
  const [nis, setNis] = useState('');
  const [searchedStudent, setSearchedStudent] = useState<Student | null>(null);
  const [paymentStatus, setPaymentStatus] = useState<'paid' | 'unpaid' | null>(null);
  const [error, setError] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSearchedStudent(null);
    setPaymentStatus(null);

    // Normalisasi input: Hapus spasi
    const query = nis.trim().toLowerCase();

    if (!query) {
       setError('Mohon masukkan nomor NIS.');
       return;
    }

    // Logika Pencarian:
    // 1. Mencocokkan ID persis
    // 2. Atau jika ID mengandung angka yang dimasukkan (Contoh: input "001" ketemu "NIS001")
    const student = students.find(s => {
        const studentId = s.id.toLowerCase();
        return studentId === query || studentId.includes(query);
    });
    
    if (!student) {
      setError('Data santri tidak ditemukan. Pastikan NIS benar.');
      return;
    }

    setSearchedStudent(student);

    // Check Payment for Current Month
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const isPaid = transactions.some(t => {
       const tDate = new Date(t.date);
       return t.relatedUserId === student.id && 
              t.type === 'infaq' &&
              tDate.getMonth() === currentMonth &&
              tDate.getFullYear() === currentYear;
    });

    setPaymentStatus(isPaid ? 'paid' : 'unpaid');
  };

  const handlePayment = () => {
    if (!searchedStudent) return;

    const newTransaction: Transaction = {
      id: `TRX-${Date.now()}`,
      type: 'infaq',
      amount: searchedStudent.infaqAmount || 150000,
      date: new Date().toISOString(),
      description: `Infaq Bulan ${new Date().toLocaleDateString('id-ID', { month: 'long' })}`,
      relatedUserId: searchedStudent.id,
      category: 'SPP'
    };

    onSave(newTransaction);
    setPaymentStatus('paid');
    alert(`Pembayaran Infaq untuk ${searchedStudent.name} berhasil dicatat.`);
  };

  const handleReset = () => {
      setNis('');
      setSearchedStudent(null);
      setPaymentStatus(null);
      setError('');
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
        className="bg-slate-50 rounded-3xl w-full max-w-lg relative z-10 shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-amber-500 p-6 text-white">
           <div className="flex justify-between items-center">
             <h3 className="text-2xl font-bold">Input Infaq Santri</h3>
             <button onClick={onClose} className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors text-white">✕</button>
           </div>
           <p className="text-orange-100 text-sm mt-1">Pembayaran Infaq Bulanan (SPP)</p>
        </div>

        <div className="p-6 bg-slate-50 min-h-[300px]">
           {/* Search Form */}
           <form onSubmit={handleSearch} className="relative mb-6">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Masukkan Angka NIS</label>
              <div className="flex gap-3">
                 <input 
                   type="text" 
                   value={nis}
                   onChange={(e) => setNis(e.target.value)}
                   placeholder="Contoh: 001"
                   className="w-full px-5 py-4 rounded-2xl bg-white border-2 border-orange-100 focus:border-orange-500 focus:ring-4 focus:ring-orange-100 outline-none font-bold text-2xl text-slate-800 shadow-sm placeholder-slate-300 transition-all text-center"
                   autoFocus
                 />
                 <button type="submit" className="bg-slate-800 text-white px-6 rounded-2xl font-bold hover:bg-slate-700 transition-colors shadow-lg shadow-slate-300">
                    Cari
                 </button>
              </div>
              {error && <p className="text-red-500 text-sm mt-2 font-medium animate-pulse text-center">{error}</p>}
           </form>

           {/* Result Area */}
           <AnimatePresence mode="wait">
             {searchedStudent && (
               <motion.div 
                 initial={{ opacity: 0, y: 10 }}
                 animate={{ opacity: 1, y: 0 }}
                 exit={{ opacity: 0, y: -10 }}
                 className="bg-white rounded-3xl p-6 border border-slate-100 shadow-xl"
               >
                  <div className="flex items-center gap-5 border-b border-slate-100 pb-5 mb-5">
                     <div className={`w-20 h-20 rounded-full flex items-center justify-center text-3xl font-bold text-white shadow-lg ${searchedStudent.program === 'Tahfidz' ? 'bg-gradient-to-br from-emerald-400 to-teal-500' : 'bg-gradient-to-br from-blue-400 to-indigo-500'}`}>
                        {searchedStudent.name.charAt(0)}
                     </div>
                     <div>
                        <h4 className="text-xl font-bold text-slate-800 leading-tight">{searchedStudent.name}</h4>
                        <p className="text-slate-500 text-sm mt-1 font-medium">{searchedStudent.id}</p>
                        <p className="text-xs text-slate-400 mt-1 bg-slate-100 inline-block px-2 py-1 rounded">{searchedStudent.branch} • {searchedStudent.program}</p>
                     </div>
                  </div>

                  <div className="space-y-5">
                     <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                        <div className="flex justify-between items-center mb-1">
                           <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Tagihan Bulan Ini</span>
                           <span className="text-slate-800 text-xl font-bold">Rp {(searchedStudent.infaqAmount || 150000).toLocaleString('id-ID')}</span>
                        </div>
                     </div>
                     
                     <div className="flex justify-between items-center">
                        <span className="text-slate-500 text-sm font-bold">Status Pembayaran</span>
                        {paymentStatus === 'paid' ? (
                           <span className="bg-emerald-100 text-emerald-700 px-4 py-1.5 rounded-full text-sm font-bold border border-emerald-200 flex items-center gap-2 shadow-sm">
                              <span className="text-lg">✓</span> LUNAS
                           </span>
                        ) : (
                           <span className="bg-red-100 text-red-700 px-4 py-1.5 rounded-full text-sm font-bold border border-red-200 shadow-sm">
                              BELUM BAYAR
                           </span>
                        )}
                     </div>

                     {/* Action Button */}
                     <div className="pt-2">
                        {paymentStatus === 'unpaid' ? (
                           <button 
                             onClick={handlePayment}
                             className="w-full py-4 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-2xl font-bold shadow-xl shadow-orange-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all text-lg"
                           >
                              Bayar Sekarang
                           </button>
                        ) : (
                           <div className="text-center mt-4">
                              <p className="text-emerald-600 text-sm font-bold mb-4 bg-emerald-50 py-2 px-4 rounded-xl inline-block">Pembayaran bulan ini sudah diterima.</p>
                              <button 
                                onClick={handleReset}
                                className="w-full py-3 bg-slate-100 text-slate-500 rounded-2xl font-bold hover:bg-slate-200 transition-colors"
                              >
                                 Cari Santri Lain
                              </button>
                           </div>
                        )}
                     </div>
                  </div>
               </motion.div>
             )}
           </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};