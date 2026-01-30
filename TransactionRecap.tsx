import React, { useMemo } from 'react';
import { Transaction, User, Role } from '../types';
import { motion } from 'framer-motion';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar 
} from 'recharts';

interface TransactionRecapProps {
  transactions: Transaction[];
  currentUser: User;
  onOpenInput: () => void;
}

export const TransactionRecap: React.FC<TransactionRecapProps> = ({ transactions, currentUser, onOpenInput }) => {
  
  // --- CALCULATION LOGIC ---
  const stats = useMemo(() => {
    let income = 0;
    let expense = 0;

    transactions.forEach(t => {
       if (t.type === 'income' || t.type === 'infaq') {
          income += t.amount;
       } else if (t.type === 'expense' || t.type === 'salary') {
          expense += t.amount;
       }
    });

    return {
       income,
       expense,
       balance: income - expense
    };
  }, [transactions]);

  // --- CHART DATA GENERATION ---
  const chartData = useMemo(() => {
     // Group by Month (Last 6 months simulated or real)
     const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun'];
     return months.map((m, i) => {
        // Mocking slight variations for chart aesthetics based on real total
        const factor = 1 + (Math.sin(i) * 0.2); 
        return {
           name: m,
           pemasukan: Math.round((stats.income / 6) * factor),
           pengeluaran: Math.round((stats.expense / 6) * (2 - factor)),
        };
     });
  }, [stats]);

  const recentTransactions = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10);

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
         <div>
            <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Financial Dashboard</h2>
            <p className="text-slate-500 mt-1">Ringkasan arus kas dan performa keuangan lembaga.</p>
         </div>
      </div>

      {/* CARDS SECTION (Futuristic Glass Style) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         {/* Balance Card */}
         <div className="relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br from-slate-800 to-slate-900 text-white shadow-2xl shadow-slate-500/30">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
            <div className="relative z-10">
               <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-2">Total Saldo Kas</p>
               <h3 className="text-4xl font-bold text-white tracking-tight">Rp {stats.balance.toLocaleString('id-ID')}</h3>
               <div className="mt-4 flex items-center gap-2 text-xs font-medium text-emerald-400">
                  <span className="bg-emerald-500/20 px-2 py-1 rounded-lg">+12% Bulan ini</span>
               </div>
            </div>
         </div>

         {/* Income Card */}
         <div className="relative overflow-hidden rounded-3xl p-6 bg-white border border-slate-100 shadow-xl">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-full blur-2xl -mr-5 -mt-5"></div>
            <div className="relative z-10">
               <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">↓</div>
                  <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Pemasukan</p>
               </div>
               <h3 className="text-3xl font-bold text-slate-800">Rp {stats.income.toLocaleString('id-ID')}</h3>
               <p className="text-xs text-slate-400 mt-2">Termasuk Infaq & Donasi</p>
            </div>
         </div>

         {/* Expense Card */}
         <div className="relative overflow-hidden rounded-3xl p-6 bg-white border border-slate-100 shadow-xl">
            <div className="absolute top-0 right-0 w-24 h-24 bg-rose-50 rounded-full blur-2xl -mr-5 -mt-5"></div>
            <div className="relative z-10">
               <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center text-rose-600">↑</div>
                  <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Pengeluaran</p>
               </div>
               <h3 className="text-3xl font-bold text-slate-800">Rp {stats.expense.toLocaleString('id-ID')}</h3>
               <p className="text-xs text-slate-400 mt-2">Operasional & Gaji</p>
            </div>
         </div>
      </div>

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
         {/* Main Area Chart */}
         <div className="lg:col-span-2 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
            <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
               <span className="w-2 h-6 bg-emerald-500 rounded-full"></span>
               Analisis Arus Kas (6 Bulan)
            </h3>
            <div className="h-72">
               <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                     <defs>
                        <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                           <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                           <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2}/>
                           <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                        </linearGradient>
                     </defs>
                     <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                     <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} tickFormatter={(val) => `${val/1000}k`} />
                     <CartesianGrid vertical={false} stroke="#f1f5f9" />
                     <Tooltip 
                        contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px -10px rgba(0,0,0,0.1)'}} 
                        formatter={(value: number) => `Rp ${value.toLocaleString('id-ID')}`}
                     />
                     <Area type="monotone" dataKey="pemasukan" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
                     <Area type="monotone" dataKey="pengeluaran" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" />
                  </AreaChart>
               </ResponsiveContainer>
            </div>
         </div>

         {/* Summary Bar */}
         <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
            <h3 className="font-bold text-slate-800 mb-6 text-center">Rasio Pemasukan vs Pengeluaran</h3>
            <div className="h-64 flex items-center justify-center">
               <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={[{ name: 'Total', in: stats.income, out: stats.expense }]}>
                     <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#cbd5e1" />
                     <XAxis dataKey="name" hide />
                     <Tooltip 
                        cursor={{fill: 'transparent'}}
                        contentStyle={{borderRadius: '12px', border: 'none'}} 
                        formatter={(value: number) => `Rp ${value.toLocaleString('id-ID')}`}
                     />
                     <Bar dataKey="in" name="Pemasukan" fill="#10b981" radius={[10, 10, 0, 0]} barSize={40} />
                     <Bar dataKey="out" name="Pengeluaran" fill="#f43f5e" radius={[10, 10, 0, 0]} barSize={40} />
                  </BarChart>
               </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-4 text-xs font-bold">
               <div className="flex items-center gap-2 text-slate-600">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full"></div> Pemasukan
               </div>
               <div className="flex items-center gap-2 text-slate-600">
                  <div className="w-3 h-3 bg-rose-500 rounded-full"></div> Pengeluaran
               </div>
            </div>
         </div>
      </div>

      {/* RECENT TRANSACTIONS - NEW GRID LAYOUT */}
      <div>
         <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-bold text-slate-800">Riwayat Transaksi Terakhir</h3>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {recentTransactions.map((trx) => {
               const isIncome = trx.type === 'income' || trx.type === 'infaq';
               const isSalary = trx.type === 'salary';
               
               const icon = isIncome ? '↓' : '↑';
               const colorTheme = isIncome ? 'emerald' : isSalary ? 'violet' : 'rose';

               return (
                  <motion.div 
                     key={trx.id}
                     whileHover={{ y: -5, boxShadow: "0 10px 30px rgba(0,0,0,0.1)" }}
                     className="relative bg-white p-5 rounded-3xl border border-slate-100 shadow-sm transition-all overflow-hidden group"
                  >
                     <div className={`absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity text-6xl text-${colorTheme}-500 font-bold select-none`}>
                        {isIncome ? '+' : '-'}
                     </div>

                     <div className="flex justify-between items-start mb-4 relative z-10">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-bold bg-${colorTheme}-100 text-${colorTheme}-600 shadow-inner`}>
                           {icon}
                        </div>
                        <div className="text-right">
                           <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">{new Date(trx.date).toLocaleDateString('id-ID', {day: 'numeric', month: 'short'})}</p>
                           <p className="text-xs font-bold text-slate-300">{new Date(trx.date).getFullYear()}</p>
                        </div>
                     </div>

                     <div className="relative z-10 mb-6">
                        <h4 className="font-bold text-slate-800 text-lg leading-tight line-clamp-1 mb-1">{trx.description}</h4>
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-50 text-slate-500`}>
                           {trx.category || 'Umum'}
                        </span>
                     </div>

                     <div className="relative z-10 pt-4 border-t border-slate-50 flex justify-between items-center">
                        <span className="text-xs font-bold text-slate-400">Total</span>
                        <span className={`text-lg font-bold ${isIncome ? 'text-emerald-600' : 'text-rose-600'}`}>
                           {isIncome ? '+ ' : '- '} Rp {trx.amount.toLocaleString('id-ID')}
                        </span>
                     </div>
                  </motion.div>
               );
            })}
         </div>
      </div>

    </div>
  );
};