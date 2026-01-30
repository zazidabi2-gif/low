import React, { useMemo, useState } from 'react';
import { Student, Transaction, User, Branch } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

interface InfaqRecapProps {
  students: Student[];
  transactions: Transaction[];
  branches: Branch[];
  currentUser: User;
}

export const InfaqRecap: React.FC<InfaqRecapProps> = ({ students, transactions, branches, currentUser }) => {
  const [activeBranchId, setActiveBranchId] = useState<string>('all');
  const [activeStatusTab, setActiveStatusTab] = useState<'paid' | 'unpaid'>('paid'); // Default: Paid (Left)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null); // State for Modal
  
  // Calculate Current Month Context
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthName = new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });

  // --- DATA PROCESSING ---
  const branchStats = useMemo(() => {
    return branches.map(branch => {
       const branchStudents = students.filter(s => s.branch === branch.name && s.status === 'active');
       
       const target = branchStudents.reduce((sum, s) => sum + (s.infaqAmount || 150000), 0);
       
       const branchTransactions = transactions.filter(t => {
           const student = branchStudents.find(s => s.id === t.relatedUserId);
           if (!student) return false;
           
           const tDate = new Date(t.date);
           return t.type === 'infaq' && tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear;
       });

       const realization = branchTransactions.reduce((sum, t) => sum + t.amount, 0);
       const percentage = target === 0 ? 0 : Math.round((realization / target) * 100);

       const paidStudentIds = branchTransactions.map(t => t.relatedUserId);
       const paidStudents = branchStudents.filter(s => paidStudentIds.includes(s.id));
       const unpaidStudents = branchStudents.filter(s => !paidStudentIds.includes(s.id));

       return {
         id: branch.id,
         name: branch.name,
         target,
         realization,
         percentage,
         paidStudents,
         unpaidStudents,
         studentCount: branchStudents.length
       };
    });
  }, [students, transactions, branches, currentMonth, currentYear]);

  // --- AGGREGATE DATA FOR "ALL" VIEW ---
  const globalStats = useMemo(() => {
     const target = branchStats.reduce((sum, b) => sum + b.target, 0);
     const realization = branchStats.reduce((sum, b) => sum + b.realization, 0);
     const percentage = target === 0 ? 0 : Math.round((realization / target) * 100);
     return { target, realization, percentage };
  }, [branchStats]);

  const barChartData = branchStats.map(b => ({
     name: b.name.replace('Cabang ', ''), 
     Target: b.target,
     Realisasi: b.realization
  }));

  // Determine displayed data based on active filters
  const displayedStudents = useMemo(() => {
    let list: Student[] = [];
    
    if (activeBranchId === 'all') {
        list = activeStatusTab === 'paid' 
            ? branchStats.flatMap(b => b.paidStudents)
            : branchStats.flatMap(b => b.unpaidStudents);
    } else {
        const b = branchStats.find(br => br.id === activeBranchId);
        if (b) {
            list = activeStatusTab === 'paid' ? b.paidStudents : b.unpaidStudents;
        }
    }
    return list;
  }, [activeBranchId, activeStatusTab, branchStats]);

  // --- HELPER: Get Payment History for Modal ---
  const getPaymentHistory = (student: Student) => {
    const year = new Date().getFullYear();
    const months = Array.from({length: 12}, (_, i) => i); // 0..11

    return months.map(monthIndex => {
        const dateObj = new Date(year, monthIndex, 1);
        const mName = dateObj.toLocaleDateString('id-ID', { month: 'long' });
        
        const trx = transactions.find(t => {
            const tDate = new Date(t.date);
            return t.relatedUserId === student.id && 
                   t.type === 'infaq' && 
                   tDate.getMonth() === monthIndex && 
                   tDate.getFullYear() === year;
        });
        
        return {
            month: mName,
            isPaid: !!trx,
            amount: trx?.amount,
            date: trx?.date
        };
    });
  };

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* HEADER SECTION */}
      <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
         <div>
            <h2 className="text-2xl font-bold text-slate-800">Rekapitulasi Infaq (SPP)</h2>
            <p className="text-slate-500 text-sm mt-1">Laporan keuangan bulanan periode <strong>{monthName}</strong>.</p>
         </div>
         <div className="flex flex-col sm:flex-row gap-3 items-end sm:items-center">
             <div className="bg-orange-50 px-4 py-3 rounded-2xl border border-orange-100 shadow-sm min-w-[200px]">
                <p className="text-xs text-orange-600 font-bold uppercase tracking-wider mb-1">Total Penerimaan Bulan Ini</p>
                <p className="text-3xl font-bold text-orange-700">Rp {globalStats.realization.toLocaleString('id-ID')}</p>
             </div>
         </div>
      </div>

      {/* BRANCH FILTERS (REMOVED 'SEMUA CABANG') */}
      <div>
         <div className="flex overflow-x-auto pb-2 gap-3 custom-scrollbar mb-4">
            {branchStats.map(b => (
               <button 
                  key={b.id}
                  onClick={() => setActiveBranchId(b.id)}
                  className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all whitespace-nowrap flex items-center gap-2 ${activeBranchId === b.id ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30' : 'bg-white text-slate-500 hover:bg-slate-50 border border-slate-200'}`}
               >
                  <span>{b.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${activeBranchId === b.id ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                     {b.percentage}%
                  </span>
               </button>
            ))}
         </div>
      </div>

      {/* STATUS TABS (Paid Left, Unpaid Right) */}
      <div className="flex bg-slate-100 p-1 rounded-2xl w-full md:w-fit">
         <button 
           onClick={() => setActiveStatusTab('paid')}
           className={`flex-1 md:flex-none px-6 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeStatusTab === 'paid' ? 'bg-white text-emerald-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
         >
           <span>Sudah Lunas</span>
           <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md text-xs">{activeBranchId === 'all' ? branchStats.reduce((acc, b) => acc + b.paidStudents.length, 0) : branchStats.find(b => b.id === activeBranchId)?.paidStudents.length}</span>
         </button>
         <button 
           onClick={() => setActiveStatusTab('unpaid')}
           className={`flex-1 md:flex-none px-6 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 ${activeStatusTab === 'unpaid' ? 'bg-white text-red-600 shadow-md' : 'text-slate-500 hover:text-slate-700'}`}
         >
           <span>Belum Lunas</span>
           <span className="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md text-xs">{activeBranchId === 'all' ? branchStats.reduce((acc, b) => acc + b.unpaidStudents.length, 0) : branchStats.find(b => b.id === activeBranchId)?.unpaidStudents.length}</span>
         </button>
      </div>

      {/* STUDENTS CARD GRID */}
      <AnimatePresence mode="wait">
        <motion.div 
           key={`${activeBranchId}-${activeStatusTab}`}
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           exit={{ opacity: 0, y: -10 }}
        >
          {displayedStudents.length === 0 ? (
             <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200">
                <p className="text-slate-400 font-medium">
                  {activeStatusTab === 'paid' ? 'Belum ada santri yang membayar bulan ini.' : 'Alhamdulillah, semua santri sudah lunas!'}
                </p>
             </div>
          ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {displayedStudents.map((student) => {
                   const isTahfidz = student.program === 'Tahfidz';
                   const gradient = isTahfidz ? 'from-emerald-400 to-teal-600' : 'from-blue-400 to-indigo-600';

                   return (
                     <motion.div
                       key={student.id}
                       layout
                       onClick={() => setSelectedStudent(student)}
                       className={`relative bg-white rounded-3xl overflow-hidden border transition-all duration-300 hover:shadow-lg cursor-pointer group ${activeStatusTab === 'paid' ? 'border-emerald-100 hover:border-emerald-300' : 'border-slate-200 hover:border-red-300'}`}
                     >
                        {/* Status Badge */}
                        <div className="absolute top-4 right-4 z-10">
                           <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border shadow-sm ${activeStatusTab === 'paid' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-red-50 text-red-600 border-red-100'}`}>
                              {activeStatusTab === 'paid' ? 'Lunas' : 'Belum Bayar'}
                           </span>
                        </div>

                        <div className="p-6 pt-8 flex flex-col items-center relative z-0">
                           {/* Avatar */}
                           <div className={`w-20 h-20 rounded-2xl rotate-3 flex items-center justify-center text-3xl font-bold text-white shadow-lg mb-4 transform transition-transform group-hover:rotate-0 group-hover:scale-105 bg-gradient-to-br ${gradient}`}>
                              {student.name.charAt(0)}
                           </div>
                           
                           {/* Info */}
                           <h3 className="font-bold text-slate-800 text-lg text-center leading-tight mb-1 line-clamp-2">{student.name}</h3>
                           <p className="text-xs text-slate-400 font-mono mb-4">{student.id}</p>
                           
                           <div className="w-full bg-slate-50 rounded-xl p-3 border border-slate-100 text-center">
                              <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Nominal Infaq</p>
                              <p className={`text-lg font-bold ${activeStatusTab === 'paid' ? 'text-emerald-600' : 'text-slate-600'}`}>
                                 Rp {(student.infaqAmount || 150000).toLocaleString('id-ID')}
                              </p>
                           </div>
                        </div>

                        <div className="px-6 pb-6 pt-2">
                           <div className="flex justify-between items-center text-xs text-slate-500 border-t border-slate-50 pt-3">
                              <span>{student.branch}</span>
                              <span className="font-semibold">{student.program}</span>
                           </div>
                           <p className="text-center text-[10px] text-emerald-600 font-bold mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                              Klik untuk lihat detail & riwayat
                           </p>
                        </div>
                     </motion.div>
                   );
                })}
             </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* GLOBAL CHARTS SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-slate-200 mt-8">
         <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <h3 className="font-bold text-slate-700 mb-6">Target vs Realisasi per Cabang</h3>
            <div className="h-64">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barChartData} margin={{top: 5, right: 30, left: 20, bottom: 5}}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                     <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12}} />
                     <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12}} tickFormatter={(val) => `${val/1000000}Jt`} />
                     <Tooltip 
                        formatter={(val: number) => `Rp ${val.toLocaleString('id-ID')}`}
                        contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'}} 
                     />
                     <Legend />
                     <Bar dataKey="Target" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
                     <Bar dataKey="Realisasi" fill="#f97316" radius={[4, 4, 0, 0]} />
                  </BarChart>
               </ResponsiveContainer>
            </div>
         </div>

         <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col">
            <h3 className="font-bold text-slate-700 mb-6">Persentase Pelunasan Global</h3>
            <div className="flex-1 flex items-center justify-center relative">
               <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-4xl font-bold text-slate-800">{globalStats.percentage}%</span>
                  <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Tercapai</span>
               </div>
               <div className="w-full h-64">
                  <ResponsiveContainer width="100%" height="100%">
                     <PieChart>
                        <Pie
                           data={[
                              { name: 'Sudah Bayar', value: globalStats.realization },
                              { name: 'Belum Bayar', value: globalStats.target - globalStats.realization }
                           ]}
                           cx="50%" cy="50%"
                           innerRadius={80} outerRadius={100}
                           paddingAngle={5}
                           dataKey="value"
                        >
                           <Cell fill="#10b981" />
                           <Cell fill="#f1f5f9" />
                        </Pie>
                     </PieChart>
                  </ResponsiveContainer>
               </div>
            </div>
         </div>
      </div>

      {/* DETAIL MODAL WITH HISTORY */}
      <AnimatePresence>
        {selectedStudent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
             <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               className="absolute inset-0 bg-black/60 backdrop-blur-sm"
               onClick={() => setSelectedStudent(null)}
             />
             <motion.div 
               initial={{ opacity: 0, scale: 0.95, y: 20 }} 
               animate={{ opacity: 1, scale: 1, y: 0 }} 
               exit={{ opacity: 0, scale: 0.95, y: 20 }}
               className="bg-white rounded-3xl w-full max-w-lg relative z-10 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
             >
                {/* Header Modal */}
                <div className={`p-6 text-white relative ${selectedStudent.program === 'Tahfidz' ? 'bg-gradient-to-r from-emerald-500 to-teal-500' : 'bg-gradient-to-r from-blue-500 to-indigo-500'}`}>
                   <button onClick={() => setSelectedStudent(null)} className="absolute top-4 right-4 bg-white/20 hover:bg-white/30 text-white rounded-full w-8 h-8 flex items-center justify-center transition-colors font-bold">Tutup</button>
                   <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-3xl font-bold text-slate-800 shadow-lg">
                         {selectedStudent.name.charAt(0)}
                      </div>
                      <div>
                         <h3 className="text-xl font-bold">{selectedStudent.name}</h3>
                         <p className="opacity-90 text-sm">{selectedStudent.id} • {selectedStudent.branch}</p>
                      </div>
                   </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
                   
                   {/* Personal Info Grid */}
                   <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm mb-6">
                      <h4 className="font-bold text-slate-800 mb-4 border-b border-slate-100 pb-2">Informasi Santri</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                         <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase">Nama Wali</p>
                            <p className="font-semibold text-slate-700">{selectedStudent.parentName || '-'}</p>
                         </div>
                         <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase">Nomor WhatsApp</p>
                            <p className="font-semibold text-slate-700">{selectedStudent.phone || '-'}</p>
                         </div>
                         <div className="col-span-2">
                            <p className="text-[10px] text-slate-400 font-bold uppercase">Alamat</p>
                            <p className="font-semibold text-slate-700">{selectedStudent.address || '-'}</p>
                         </div>
                         <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase">Pengajar</p>
                            <p className="font-semibold text-slate-700">{selectedStudent.teacherId.replace('u_', 'Ust. ').replace('_', ' ')}</p>
                         </div>
                         <div>
                            <p className="text-[10px] text-slate-400 font-bold uppercase">Nominal Infaq</p>
                            <p className="font-bold text-emerald-600">Rp {(selectedStudent.infaqAmount || 150000).toLocaleString('id-ID')}</p>
                         </div>
                      </div>
                   </div>

                   {/* Payment History List */}
                   <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                      <div className="p-4 border-b border-slate-100 bg-slate-50">
                         <h4 className="font-bold text-slate-800">Riwayat Pembayaran {currentYear}</h4>
                      </div>
                      <div className="divide-y divide-slate-50">
                         {getPaymentHistory(selectedStudent).map((item, idx) => (
                            <div key={idx} className="p-3 flex justify-between items-center hover:bg-slate-50 transition-colors">
                               <div className="flex items-center gap-3">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${item.isPaid ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                     {item.month.substring(0, 3)}
                                  </div>
                                  <div>
                                     <p className={`text-sm font-bold ${item.isPaid ? 'text-slate-700' : 'text-slate-400'}`}>{item.month}</p>
                                     {item.isPaid && <p className="text-[10px] text-slate-400">{new Date(item.date).toLocaleDateString('id-ID')}</p>}
                                  </div>
                               </div>
                               <div>
                                  {item.isPaid ? (
                                     <div className="text-right">
                                        <p className="text-xs font-bold text-emerald-600">Rp {item.amount.toLocaleString('id-ID')}</p>
                                        <p className="text-[10px] text-emerald-500 font-bold uppercase">Lunas</p>
                                     </div>
                                  ) : (
                                     <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded-full uppercase">Belum Bayar</span>
                                  )}
                               </div>
                            </div>
                         ))}
                      </div>
                   </div>

                </div>

                {/* Footer */}
                <div className="p-4 bg-white border-t border-slate-100 flex justify-end">
                   <button onClick={() => setSelectedStudent(null)} className="w-full py-3 bg-slate-800 text-white font-bold rounded-xl hover:bg-slate-700 transition-colors">
                      Tutup
                   </button>
                </div>

             </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};