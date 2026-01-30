import React, { useState, useEffect, createContext, useContext } from 'react';
import { 
  Role, User, Student, OrgStructure, CalendarEvent, AppSettings, Branch, Transaction
} from './types';
import { 
  INITIAL_USERS, INITIAL_STUDENTS, INITIAL_STRUCTURE, INITIAL_CALENDAR, DEFAULT_SETTINGS, INITIAL_BRANCHES, INITIAL_TRANSACTIONS
} from './constants';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import { DataList } from './components/Management';
import { OrgChart } from './components/OrgChart';
import { AttendanceRecap } from './components/AttendanceRecap';
import { InputAttendance } from './components/InputAttendance';
import { MutabaahRecap } from './components/MutabaahRecap';
import { InputMutabaah } from './components/InputMutabaah';
import { ExamRecap } from './components/ExamRecap';
import { InputExam } from './components/InputExam';
import { InputStudent } from './components/InputStudent';
import { InfaqRecap } from './components/InfaqRecap';
import { InputInfaq } from './components/InputInfaq';
import { TransactionRecap } from './components/TransactionRecap'; 
import { InputTransaction } from './components/InputTransaction'; 
import { motion, AnimatePresence } from 'framer-motion';

// --- Context ---
interface AppContextType {
  currentUser: User | null;
  settings: AppSettings;
  students: Student[];
  users: User[];
  structure: OrgStructure[];
  calendar: CalendarEvent[];
  branches: Branch[];
  transactions: Transaction[]; 
  login: (user: User) => void;
  logout: () => void;
  updateSettings: (s: AppSettings) => void;
  registerUser: (u: User) => void;
}

const AppContext = createContext<AppContextType | null>(null);

// --- Layout Component ---
const Layout: React.FC<{ 
  children: React.ReactNode; 
  examResults: any; 
  updateExamResults: any;
  updateStudentData: (id: string, data: Partial<Student>) => void;
  addStudent: (student: Student) => void;
  addTransaction: (transaction: Transaction) => void; 
}> = ({ children, examResults, updateExamResults, updateStudentData, addStudent, addTransaction }) => {
  const ctx = useContext(AppContext);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeMenu, setActiveMenu] = useState('dashboard');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  // Modals State
  const [showInputAttendance, setShowInputAttendance] = useState(false);
  const [showInputMutabaah, setShowInputMutabaah] = useState(false);
  const [showInputExam, setShowInputExam] = useState(false);
  const [showInputStudent, setShowInputStudent] = useState(false);
  const [showInputInfaq, setShowInputInfaq] = useState(false); 
  const [showInputTransaction, setShowInputTransaction] = useState(false); 
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false); 
  
  // Responsive sidebar
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) setSidebarOpen(false);
      else setSidebarOpen(true);
    };
    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!ctx || !ctx.currentUser) return null;
  const { currentUser, settings, logout, updateSettings } = ctx;

  // Modified menus
  const menus = [
    { id: 'dashboard', label: 'Dashboard', roles: [Role.ADMIN, Role.TEACHER, Role.STAFF, Role.GUARDIAN] },
    { id: 'santri', label: 'Data Santri', roles: [Role.ADMIN, Role.STAFF] },
    { id: 'pengajar', label: 'Data Pengajar & Staf', roles: [Role.ADMIN] },
    { id: 'cabang', label: 'Data Cabang', roles: [Role.ADMIN] },
    { id: 'absensi', label: 'Rekap Absensi', roles: [Role.ADMIN, Role.TEACHER, Role.STAFF, Role.GUARDIAN] },
    { id: 'rapor', label: "Rekap Mu'taba'ah", roles: [Role.ADMIN, Role.TEACHER, Role.STAFF, Role.GUARDIAN] },
    { id: 'ujian', label: 'Rekap Hasil Ujian', roles: [Role.ADMIN, Role.TEACHER, Role.STAFF, Role.GUARDIAN] },
    { id: 'infaq', label: 'Rekap Infaq (SPP)', roles: [Role.ADMIN, Role.STAFF, Role.GUARDIAN] }, 
    { id: 'bisyaroh', label: 'Rekap Bisyaroh', roles: [Role.ADMIN, Role.TEACHER, Role.STAFF] },
    { id: 'transaksi', label: 'Transaksi Keuangan', roles: [Role.ADMIN, Role.STAFF] },
    { id: 'struktur', label: 'Struktur Lembaga', roles: [Role.ADMIN, Role.TEACHER, Role.STAFF, Role.GUARDIAN] },
    { id: 'kalender', label: 'Kalender Akademik', roles: [Role.ADMIN, Role.TEACHER, Role.STAFF, Role.GUARDIAN] },
    { id: 'pengaturan', label: 'Pengaturan', roles: [Role.ADMIN, Role.TEACHER, Role.STAFF, Role.GUARDIAN] },
  ];

  const filteredMenus = menus.filter(m => m.roles.includes(currentUser.role));

  const handleDropdownAction = (action: string) => {
    setIsDropdownOpen(false);
    if (action === 'logout') logout();
    if (action === 'input_attendance') setShowInputAttendance(true);
    if (action === 'input_mutabaah') setShowInputMutabaah(true);
    if (action === 'input_exam') setShowInputExam(true);
    if (action === 'add_student') setShowInputStudent(true); 
    if (action === 'input_infaq') setShowInputInfaq(true);
    if (action === 'input_transaction') setShowInputTransaction(true);
    if (action === 'profile') setShowProfileModal(true);
    if (action === 'export') setShowExportModal(true);
  };

  const handleSaveExam = (data: Record<string, any>) => {
    updateExamResults(data);
  };

  // --- EXPORT LOGIC FUNCTIONS ---
  const handleExportInfaq = () => {
    alert('Export Infaq Logic'); 
  };
  const handleExportSantri = () => {
    alert('Export Santri Logic'); 
  };
  const handleExportDummy = (type: string) => {
    alert(`Fitur Export ${type} akan segera hadir.`);
    setShowExportModal(false);
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      {/* Sidebar */}
      <aside 
        className={`${sidebarOpen ? 'w-64' : 'w-0 md:w-20'} bg-white border-r border-slate-200 transition-all duration-300 flex flex-col z-50 absolute md:relative h-full`}
      >
        <div className="h-20 flex items-center justify-center border-b border-slate-100">
          <img src={settings.logoUrl} className="w-10 h-10 mr-2" alt="Logo" />
          {sidebarOpen && (
             <div className="flex flex-col">
                <span className="font-bold text-emerald-600 leading-tight">{settings.appName}</span>
                <span className="text-[10px] text-slate-500">Yayasan Tunas Tahfidz</span>
             </div>
          )}
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-2">
            {filteredMenus.map(menu => (
              <li key={menu.id}>
                <button
                  onClick={() => setActiveMenu(menu.id)}
                  className={`w-full flex items-center p-3 rounded-xl transition-colors ${
                    activeMenu === menu.id 
                    ? 'bg-gradient-to-r from-emerald-50 to-sky-50 text-emerald-600 border border-emerald-100' 
                    : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="text-sm font-medium">{menu.label}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full relative">
        {/* Header - INCREASED Z-INDEX to z-40 to stay above content (z-10) */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-6 sticky top-0 z-40">
          <div className="flex items-center">
            <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2 hover:bg-slate-100 rounded-lg mr-4 font-bold text-slate-500">
               MENU
            </button>
            <h1 className="text-xl font-bold text-slate-800 hidden md:block">{filteredMenus.find(m => m.id === activeMenu)?.label}</h1>
          </div>
          
          {/* Header Right - Plus Button Dropdown */}
          <div className="flex items-center gap-4 relative">
             <div className="relative">
               <button 
                 onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                 className="w-10 h-10 rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 hover:scale-105 transition-transform font-bold"
               >
                 +
               </button>

               <AnimatePresence>
                 {isDropdownOpen && (
                   <motion.div 
                     initial={{ opacity: 0, y: 10, scale: 0.95 }}
                     animate={{ opacity: 1, y: 0, scale: 1 }}
                     exit={{ opacity: 0, y: 10, scale: 0.95 }}
                     className="absolute right-0 top-full mt-3 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 z-[100] origin-top-right ring-1 ring-black/5"
                   >
                     <div className="px-3 py-2 border-b border-slate-50 mb-1">
                       <p className="text-xs text-slate-400 font-bold uppercase">Menu Cepat</p>
                     </div>

                     {/* MENU UNTUK STAFF */}
                     {(currentUser.role === Role.STAFF) && (
                       <>
                         <button onClick={() => handleDropdownAction('add_student')} className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-3 transition-colors mb-1">
                            <span className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs">👤</span> Input Santri Baru
                         </button>
                         {/* ONLY STAFF CAN INPUT INFAQ */}
                         <button onClick={() => handleDropdownAction('input_infaq')} className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-orange-50 hover:text-orange-600 flex items-center gap-3 transition-colors mb-1">
                            <span className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 text-xs">💰</span> Input Infaq (SPP)
                         </button>
                         {/* ONLY STAFF CAN INPUT GENERAL TRANSACTION */}
                         <button onClick={() => handleDropdownAction('input_transaction')} className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-rose-50 hover:text-rose-600 flex items-center gap-3 transition-colors mb-1">
                            <span className="w-6 h-6 rounded-full bg-rose-100 flex items-center justify-center text-rose-600 text-xs">📊</span> Input Keuangan (Umum)
                         </button>
                       </>
                     )}
                     
                     {/* MENU INPUT UNTUK PENGAJAR & STAF (ABSENSI) */}
                     {(currentUser.role === Role.TEACHER || currentUser.role === Role.STAFF) && (
                        <button onClick={() => handleDropdownAction('input_attendance')} className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-600 flex items-center gap-3 transition-colors">
                          <span className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 text-xs">📅</span> Input Absensi
                        </button>
                     )}

                     {/* EXPORT DATA MENU */}
                     {(currentUser.role === Role.ADMIN || currentUser.role === Role.STAFF) && (
                        <button onClick={() => handleDropdownAction('export')} className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-indigo-50 hover:text-indigo-600 flex items-center gap-3 transition-colors">
                           <span className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-xs">📥</span> Export Data
                        </button>
                     )}

                     {/* MENU INPUT KHUSUS PENGAJAR */}
                     {currentUser.role === Role.TEACHER && (
                       <>
                        <button onClick={() => handleDropdownAction('input_mutabaah')} className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-teal-50 hover:text-teal-600 flex items-center gap-3 transition-colors">
                          <span className="w-6 h-6 rounded-full bg-teal-100 flex items-center justify-center text-teal-600 text-xs">📖</span> Input Mu'taba'ah
                        </button>
                        <button onClick={() => handleDropdownAction('input_exam')} className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-800 flex items-center gap-3 transition-colors">
                          <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-xs">📝</span> Input Nilai Ujian
                        </button>
                       </>
                     )}
                     
                     <div className="my-1 border-t border-slate-50"></div>
                     
                     <button onClick={() => handleDropdownAction('profile')} className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 hover:bg-sky-50 hover:text-sky-600 flex items-center gap-3 transition-colors">
                       <span className="w-6 h-6 rounded-full bg-sky-100 flex items-center justify-center text-sky-600 text-xs">⚙️</span> Profile
                     </button>
                     
                     <button onClick={() => handleDropdownAction('logout')} className="w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 flex items-center gap-3 transition-colors">
                       <span className="w-6 h-6 rounded-full bg-red-100 flex items-center justify-center text-red-600 text-xs">🚪</span> Keluar
                     </button>
                   </motion.div>
                 )}
               </AnimatePresence>
             </div>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 scroll-smooth bg-slate-50/50">
           {activeMenu === 'dashboard' && <Dashboard user={currentUser} />}
           {activeMenu === 'santri' && (
             <DataList 
               type="student" 
               data={ctx.students} 
               canEdit={currentUser.role === Role.STAFF || currentUser.role === Role.ADMIN} 
               onEdit={updateStudentData}
               teachers={ctx.users}
             />
           )}
           {activeMenu === 'pengajar' && (
             <DataList 
               type="staff" 
               data={ctx.users.filter(u => u.role === Role.TEACHER || u.role === Role.STAFF)} 
               canEdit={currentUser.role === Role.ADMIN} 
             />
           )}
           {activeMenu === 'cabang' && (
             <DataList 
               type="branch" 
               data={ctx.branches} 
               canEdit={currentUser.role === Role.ADMIN} 
             />
           )}
           {activeMenu === 'absensi' && (
             <AttendanceRecap 
               currentUser={currentUser} 
               settings={settings} 
               onUpdateSettings={updateSettings} 
               students={ctx.students}
             />
           )}
           {activeMenu === 'rapor' && (
             <MutabaahRecap 
               currentUser={currentUser}
               students={ctx.students}
             />
           )}
           {activeMenu === 'ujian' && (
             <ExamRecap
                currentUser={currentUser}
                students={ctx.students}
                examResults={examResults}
                onUpdateExam={(id, data) => handleSaveExam({[id]: data})}
             />
           )}
           {activeMenu === 'infaq' && (
             <InfaqRecap 
                students={ctx.students}
                transactions={ctx.transactions}
                branches={ctx.branches}
                currentUser={currentUser}
             />
           )}
           
           {/* Transaction Recap Component */}
           {activeMenu === 'transaksi' && (
             <TransactionRecap 
                transactions={ctx.transactions}
                currentUser={currentUser}
                onOpenInput={() => setShowInputTransaction(true)}
             />
           )}

           {activeMenu === 'struktur' && <OrgChart data={ctx.structure} />}
           
           {/* Placeholders */}
           {['bisyaroh', 'kalender', 'pengaturan'].includes(activeMenu) && (
             <div className="bg-white rounded-3xl p-10 text-center shadow-sm border border-slate-100">
               <h2 className="text-2xl font-bold text-slate-300 mb-4">Fitur {filteredMenus.find(m => m.id === activeMenu)?.label}</h2>
               <p className="text-slate-400">Halaman ini telah terintegrasi dan siap dikembangkan lebih lanjut sesuai spesifikasi.</p>
               {activeMenu === 'bisyaroh' && (
                 <div className="mt-6 p-4 bg-emerald-50 rounded-xl border border-emerald-100 max-w-md mx-auto">
                    <p className="text-emerald-800 text-sm font-medium">Info Gaji</p>
                    <p className="text-emerald-600 text-xs mt-1">Periode hitung: Tgl 26 bln lalu s/d 25 bln ini.</p>
                 </div>
               )}
             </div>
           )}
        </div>

        {/* Modals are the same... */}
        <AnimatePresence>
          {showInputAttendance && (
            <InputAttendance 
               isOpen={showInputAttendance}
               onClose={() => setShowInputAttendance(false)}
               currentUser={currentUser}
               students={ctx.students}
            />
          )}
        </AnimatePresence>
        <AnimatePresence>
          {showInputMutabaah && (
            <InputMutabaah
              isOpen={showInputMutabaah}
              onClose={() => setShowInputMutabaah(false)}
              currentUser={currentUser}
              students={ctx.students}
            />
          )}
        </AnimatePresence>
        <AnimatePresence>
          {showInputExam && (
            <InputExam
              isOpen={showInputExam}
              onClose={() => setShowInputExam(false)}
              currentUser={currentUser}
              students={ctx.students}
              existingResults={examResults}
              onSave={handleSaveExam}
              onUpdateStudent={updateStudentData}
            />
          )}
        </AnimatePresence>
        <AnimatePresence>
          {showInputStudent && (
             <InputStudent
                isOpen={showInputStudent}
                onClose={() => setShowInputStudent(false)}
                onSave={addStudent}
                branches={ctx.branches}
                teachers={ctx.users.filter(u => u.role === Role.TEACHER)}
             />
          )}
        </AnimatePresence>
        <AnimatePresence>
          {showInputInfaq && (
             <InputInfaq
                isOpen={showInputInfaq}
                onClose={() => setShowInputInfaq(false)}
                students={ctx.students}
                transactions={ctx.transactions}
                onSave={addTransaction}
             />
          )}
        </AnimatePresence>
        <AnimatePresence>
          {showInputTransaction && (
             <InputTransaction
                isOpen={showInputTransaction}
                onClose={() => setShowInputTransaction(false)}
                onSave={addTransaction}
                currentUser={currentUser}
             />
          )}
        </AnimatePresence>
        <AnimatePresence>
          {showExportModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
               <motion.div 
                 initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                 className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                 onClick={() => setShowExportModal(false)}
               />
               <motion.div 
                 initial={{ opacity: 0, scale: 0.95, y: 20 }} 
                 animate={{ opacity: 1, scale: 1, y: 0 }} 
                 exit={{ opacity: 0, scale: 0.95, y: 20 }}
                 className="bg-white rounded-3xl w-full max-w-lg relative z-10 shadow-2xl p-6"
               >
                  <div className="flex justify-between items-center mb-6">
                     <div>
                        <h3 className="text-xl font-bold text-slate-800">Export Data Laporan</h3>
                        <p className="text-slate-500 text-sm">Pilih jenis data yang ingin diunduh (PDF)</p>
                     </div>
                     <button onClick={() => setShowExportModal(false)} className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center font-bold">Tutup</button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                     <button onClick={handleExportSantri} className="p-4 rounded-2xl border-2 border-slate-100 hover:border-blue-500 hover:bg-blue-50 transition-all group flex flex-col items-center gap-2">
                        <span className="text-sm font-bold text-slate-700 group-hover:text-blue-700">Data Santri</span>
                     </button>
                     <button onClick={() => handleExportDummy('Absensi')} className="p-4 rounded-2xl border-2 border-slate-100 hover:border-emerald-500 hover:bg-emerald-50 transition-all group flex flex-col items-center gap-2">
                        <span className="text-sm font-bold text-slate-700 group-hover:text-emerald-700">Rekap Absensi</span>
                     </button>
                     <button onClick={() => handleExportDummy('Mutabaah')} className="p-4 rounded-2xl border-2 border-slate-100 hover:border-teal-500 hover:bg-teal-50 transition-all group flex flex-col items-center gap-2">
                        <span className="text-sm font-bold text-slate-700 group-hover:text-teal-700">Rekap Mu'taba'ah</span>
                     </button>
                     <button onClick={() => handleExportDummy('Ujian')} className="p-4 rounded-2xl border-2 border-slate-100 hover:border-indigo-500 hover:bg-indigo-50 transition-all group flex flex-col items-center gap-2">
                        <span className="text-sm font-bold text-slate-700 group-hover:text-indigo-700">Rekap Ujian</span>
                     </button>
                     <button onClick={handleExportInfaq} className="p-4 rounded-2xl border-2 border-slate-100 hover:border-orange-500 hover:bg-orange-50 transition-all group flex flex-col items-center gap-2 col-span-2">
                        <span className="text-sm font-bold text-slate-700 group-hover:text-orange-700">Rekap Infaq (SPP)</span>
                     </button>
                  </div>
               </motion.div>
            </div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {showProfileModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
                onClick={() => setShowProfileModal(false)}
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white rounded-3xl overflow-hidden w-full max-w-md relative z-10 shadow-2xl"
              >
                <div className="h-24 bg-gradient-to-r from-emerald-500 to-teal-500 relative">
                   <button onClick={() => setShowProfileModal(false)} className="absolute top-4 right-4 text-white/80 hover:text-white font-bold">Tutup</button>
                </div>
                <div className="px-6 pb-6 relative">
                   <div className="w-24 h-24 rounded-full bg-white p-1 absolute -top-12 left-6 shadow-lg">
                      <div className="w-full h-full rounded-full bg-slate-200 flex items-center justify-center text-xl font-bold text-slate-500">
                        IMG
                      </div>
                   </div>
                   <div className="mt-14">
                      <h3 className="text-2xl font-bold text-slate-800">{currentUser.name}</h3>
                      <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-bold uppercase mt-2">{currentUser.role}</span>
                      
                      <div className="mt-6 space-y-4">
                         <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <div>
                               <p className="text-xs text-slate-400 font-bold uppercase">Cabang</p>
                               <p className="font-semibold text-slate-700">{currentUser.branch || 'Pusat'}</p>
                            </div>
                         </div>
                         <div className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
                            <div>
                               <p className="text-xs text-slate-400 font-bold uppercase">ID / Username</p>
                               <p className="font-semibold text-slate-700">{currentUser.username || currentUser.id}</p>
                            </div>
                         </div>
                      </div>

                      <div className="mt-6 flex justify-end">
                         <button onClick={() => alert('Fitur Edit Profil akan segera hadir')} className="px-4 py-2 bg-slate-800 text-white rounded-xl text-sm font-bold shadow-lg shadow-slate-500/30 hover:bg-slate-700 transition-colors">Edit Profil</button>
                      </div>
                   </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </main>
    </div>
  );
};

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  
  // Data States
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [branches, setBranches] = useState<Branch[]>(INITIAL_BRANCHES);
  const [structure, setStructure] = useState<OrgStructure[]>(INITIAL_STRUCTURE);
  const [calendar, setCalendar] = useState<CalendarEvent[]>(INITIAL_CALENDAR);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  
  // Exam Results State (In-memory for demo)
  const [examResults, setExamResults] = useState<Record<string, any>>({});

  const login = (user: User) => {
    setCurrentUser(user);
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const registerUser = (newUser: User) => {
    setUsers([...users, newUser]);
  };

  const updateSettings = (newSettings: AppSettings) => {
    setSettings(newSettings);
  };

  const updateStudentData = (id: string, newData: Partial<Student>) => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, ...newData } : s));
  };

  const addStudent = (student: Student) => {
    setStudents([...students, student]);
  };

  const updateExamResults = (newResults: Record<string, any>) => {
    setExamResults(prev => ({ ...prev, ...newResults }));
  };
  
  const addTransaction = (transaction: Transaction) => {
      setTransactions(prev => [transaction, ...prev]);
  };

  const contextValue: AppContextType = {
    currentUser,
    settings,
    students,
    users,
    structure,
    calendar,
    branches,
    transactions,
    login,
    logout,
    updateSettings,
    registerUser
  };

  if (!currentUser) {
    return <Login onLogin={login} onRegister={registerUser} />;
  }

  return (
    <AppContext.Provider value={contextValue}>
      <Layout 
        examResults={examResults} 
        updateExamResults={updateExamResults}
        updateStudentData={updateStudentData}
        addStudent={addStudent}
        addTransaction={addTransaction}
      >
        {null}
      </Layout>
    </AppContext.Provider>
  );
};

export default App;