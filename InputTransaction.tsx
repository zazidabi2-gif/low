import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Transaction, User } from '../types';

interface InputTransactionProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: Transaction) => void;
  currentUser: User;
}

export const InputTransaction: React.FC<InputTransactionProps> = ({ isOpen, onClose, onSave, currentUser }) => {
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');

  // Predefined categories
  const expenseCategories = ['Operasional', 'Gaji Pengajar', 'Perlengkapan/ATK', 'Listrik & Air', 'Pemeliharaan Gedung', 'Acara/Kegiatan', 'Lainnya'];
  const incomeCategories = ['Donasi Umum', 'Hibah', 'Kotak Amal', 'Penjualan Merchandise', 'Lainnya'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newTransaction: Transaction = {
      id: `TRX-GEN-${Date.now()}`,
      type: type,
      amount: Number(amount),
      date: new Date(date).toISOString(),
      description: description,
      category: category || 'Umum',
      relatedUserId: currentUser.id // Recorded by Staff
    };
    
    onSave(newTransaction);
    alert('Transaksi berhasil dicatat.');
    onClose();
    // Reset form
    setAmount('');
    setDescription('');
    setCategory('');
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
        className="bg-white rounded-3xl w-full max-w-lg relative z-10 shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className={`p-6 text-white ${type === 'income' ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gradient-to-r from-rose-500 to-pink-500'}`}>
           <div className="flex justify-between items-center">
             <h3 className="text-2xl font-bold">Input Keuangan</h3>
             <button onClick={onClose} className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors text-white">✕</button>
           </div>
           <p className="text-white/80 text-sm mt-1">Catat pemasukan atau pengeluaran operasional.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 bg-slate-50 space-y-5">
           
           {/* Type Toggle */}
           <div className="flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
              <button
                type="button"
                onClick={() => setType('income')}
                className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 ${type === 'income' ? 'bg-emerald-100 text-emerald-700 shadow-sm' : 'text-slate-400 hover:bg-slate-50'}`}
              >
                 <span>⬇️ Pemasukan</span>
              </button>
              <button
                type="button"
                onClick={() => setType('expense')}
                className={`flex-1 py-3 rounded-lg font-bold text-sm transition-all flex items-center justify-center gap-2 ${type === 'expense' ? 'bg-rose-100 text-rose-700 shadow-sm' : 'text-slate-400 hover:bg-slate-50'}`}
              >
                 <span>⬆️ Pengeluaran</span>
              </button>
           </div>

           {/* Amount */}
           <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Nominal (Rp)</label>
              <input 
                type="number" 
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-lg text-slate-700"
                placeholder="0"
              />
           </div>

           {/* Date & Category */}
           <div className="grid grid-cols-2 gap-4">
              <div>
                 <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Tanggal</label>
                 <input 
                   type="date" 
                   required
                   value={date}
                   onChange={(e) => setDate(e.target.value)}
                   className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-medium"
                 />
              </div>
              <div>
                 <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Kategori</label>
                 <select 
                   required
                   value={category}
                   onChange={(e) => setCategory(e.target.value)}
                   className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-medium bg-white"
                 >
                    <option value="">Pilih...</option>
                    {(type === 'income' ? incomeCategories : expenseCategories).map(c => (
                       <option key={c} value={c}>{c}</option>
                    ))}
                 </select>
              </div>
           </div>

           {/* Description */}
           <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Keterangan</label>
              <textarea 
                required
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-medium"
                placeholder="Contoh: Pembelian spidol, Donasi hamba Allah..."
              ></textarea>
           </div>

           <button 
             type="submit" 
             className={`w-full py-4 rounded-xl text-white font-bold shadow-lg transition-transform active:scale-[0.98] ${type === 'income' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/30' : 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/30'}`}
           >
              Simpan Transaksi
           </button>
        </form>
      </motion.div>
    </div>
  );
};