import React, { useState, useEffect } from 'react';
import { Role, User } from '../types';
import { INITIAL_USERS } from '../constants';
import { motion, AnimatePresence } from 'framer-motion';

interface LoginProps {
  onLogin: (user: User) => void;
  onRegister: (user: User) => void;
}

// Curated list of mosque images
const MOSQUE_IMAGES = [
  "https://images.unsplash.com/photo-1565552629477-0ac676c8a66d?q=80&w=1600&auto=format&fit=crop", // Makkah
  "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?q=80&w=1600&auto=format&fit=crop", // Madinah
  "https://images.unsplash.com/photo-1564769662533-4f00dad784a1?q=80&w=1600&auto=format&fit=crop", // Al Aqsa
  "https://images.unsplash.com/photo-1542621334-a25916e6e2bb?q=80&w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1580418827493-f2b22c4f7ceb?q=80&w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1519817650390-64a93db51149?q=80&w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?q=80&w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1596627008797-1e3e8f81014a?q=80&w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1570163354316-296e6d5eb5b0?q=80&w=1600&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1597952949779-7a70e7e6f663?q=80&w=1600&auto=format&fit=crop",
];

// 30 Islamic Quotes
const ISLAMIC_QUOTES = [
  { text: "Sebaik-baik kalian adalah yang mempelajari Al-Qur'an dan mengajarkannya.", source: "HR. Bukhari" },
  { text: "Tuntutlah ilmu dari buaian hingga liang lahat.", source: "Mahfudzot" },
  { text: "Barangsiapa menempuh jalan untuk mencari ilmu, maka Allah akan mudahkan baginya jalan menuju surga.", source: "HR. Muslim" },
  { text: "Sesungguhnya Allah itu indah dan menyukai keindahan.", source: "HR. Muslim" },
  { text: "Shalat itu adalah tiang agama.", source: "HR. Tirmidzi" },
  { text: "Kebersihan itu sebagian dari iman.", source: "HR. Tirmidzi" },
  { text: "Senyummu di hadapan saudaramu adalah sedekah.", source: "HR. Tirmidzi" },
  { text: "Maka sesungguhnya bersama kesulitan ada kemudahan.", source: "QS. Al-Insyirah: 5" },
  { text: "Dan berbuat baiklah, karena sesungguhnya Allah menyukai orang-orang yang berbuat baik.", source: "QS. Al-Baqarah: 195" },
  { text: "Wahai orang-orang yang beriman, jadikanlah sabar dan shalat sebagai penolongmu.", source: "QS. Al-Baqarah: 153" },
];

type ModalType = 'admin' | 'teacher' | 'staff' | 'guardian' | 'register' | 'role_selection' | null;

const Login: React.FC<LoginProps> = ({ onLogin, onRegister }) => {
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [bgIndex, setBgIndex] = useState(0);
  const [quoteIndex, setQuoteIndex] = useState(0);

  // Form States
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState(''); 
  const [email, setEmail] = useState('');
  const [nis, setNis] = useState('');
  
  // Registration States
  const [regRole, setRegRole] = useState<'teacher' | 'staff'>('teacher');
  const [fullName, setFullName] = useState('');
  const [address, setAddress] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [branch, setBranch] = useState('');
  const [classTypes, setClassTypes] = useState<string[]>([]);

  // Background rotater
  useEffect(() => {
    const interval = setInterval(() => {
      setBgIndex((prev) => (prev + 1) % MOSQUE_IMAGES.length);
    }, 8000); 
    return () => clearInterval(interval);
  }, []);

  // Quote rotater
  useEffect(() => {
    const interval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % ISLAMIC_QUOTES.length);
    }, 10000); 
    return () => clearInterval(interval);
  }, []);

  const openModal = (type: ModalType, role?: 'teacher' | 'staff') => {
    resetForm();
    if (type === 'register' && role) setRegRole(role);
    setActiveModal(type);
  };

  const closeModal = () => {
    setActiveModal(null);
  };

  const resetForm = () => {
    setUsername(''); setPassword(''); setEmail(''); setNis('');
    setFullName(''); setAddress(''); setWhatsapp(''); setBranch(''); setClassTypes([]);
  };

  const handleClassTypeChange = (type: string) => {
    if (classTypes.includes(type)) {
      setClassTypes(classTypes.filter(t => t !== type));
    } else {
      setClassTypes([...classTypes, type]);
    }
  };

  // --- Login Handlers ---

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const validAdmins = ['zazid', 'zayd', 'zulkifli'];
    if (validAdmins.includes(username.toLowerCase())) {
      const user = INITIAL_USERS.find(u => u.username === username.toLowerCase() && u.role === Role.ADMIN) || {
        id: 'admin-' + Date.now(),
        name: username.charAt(0).toUpperCase() + username.slice(1),
        role: Role.ADMIN,
        username: username,
        isActive: true
      };
      onLogin(user);
    } else {
      alert('Username Admin tidak terdaftar!');
    }
  };

  const handleTeacherLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Teacher requires username/email AND password
    if ((username.trim() || email.trim()) && password) {
      const user: User = {
        id: 'demo-teacher', name: 'Ustadz ' + (username || 'Fulan'), role: Role.TEACHER, branch: 'Pusat', isActive: true
      };
      onLogin(user);
    } else {
      alert("Mohon lengkapi username dan password");
    }
  };

  const handleStaffLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Staff only requires username (per instruction)
    if (username.trim()) {
      const user: User = {
        id: 'demo-staff', name: 'Staf ' + username, role: Role.STAFF, branch: 'Pusat', isActive: true, username
      };
      onLogin(user);
    } else {
      alert("Mohon isi username");
    }
  };

  const handleGuardianLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Guardian only requires NIS
    if (nis.trim()) {
      const user: User = {
        id: nis, name: `Wali Santri ${nis}`, role: Role.GUARDIAN, username: nis, isActive: true
      };
      onLogin(user);
    } else {
      alert("Mohon isi NIS santri");
    }
  };

  const handleRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: User = {
      id: Date.now().toString(),
      name: fullName,
      role: regRole === 'teacher' ? Role.TEACHER : Role.STAFF,
      username: username,
      email: email,
      branch: branch,
      phone: whatsapp,
      isActive: true
    };
    console.log("Registered:", { ...newUser, address, classTypes });
    onRegister(newUser);
    alert('Pendaftaran berhasil! Silakan login.');
    closeModal();
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative bg-slate-900 font-sans">
      {/* Dynamic Background */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {MOSQUE_IMAGES.map((img, index) => (
          <div 
            key={index}
            className={`absolute inset-0 bg-cover bg-center transition-opacity duration-[2000ms] ease-in-out ${index === bgIndex ? 'opacity-100' : 'opacity-0'}`}
            style={{ backgroundImage: `url(${img})` }}
          />
        ))}
        {/* Modern Dark Overlay with Gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-slate-800/40 mix-blend-multiply"></div>
        <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]"></div>
      </div>

      {/* Main Container */}
      <div className="relative z-20 w-full h-full md:h-auto flex flex-col items-center justify-center p-4">
        
        {/* Header Greeting */}
        <div className="text-center mb-8 animate-fade-in-down text-white drop-shadow-2xl w-full max-w-4xl px-4">
          <h1 className="font-arabic text-4xl md:text-6xl mb-4 text-emerald-50 leading-relaxed drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">السلام عليكم ورحمة الله وبركاته</h1>
          <div className="w-full overflow-hidden border-b border-white/20 pb-2">
            <div className="text-sm md:text-base text-white/90 font-light tracking-widest uppercase animate-marquee">
              "Berkembang lebih cepat dan bermanfaat lebih luas"
            </div>
          </div>
        </div>

        {/* Login Card - Fully Transparent Glass */}
        <div className="w-full max-w-md md:max-w-5xl bg-white/5 backdrop-blur-xl rounded-3xl overflow-hidden shadow-[0_8px_32px_0_rgba(0,0,0,0.37)] flex flex-col md:flex-row border border-white/10 ring-1 ring-white/5">
          
          {/* Left Panel: Info & Illustration (Desktop) - Enhanced Glass */}
          <div className="hidden md:flex flex-col justify-between w-2/5 p-8 bg-gradient-to-br from-emerald-900/40 via-transparent to-slate-900/40 relative overflow-hidden border-r border-white/10">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-50"></div>
            
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center gap-4 mb-8">
                <div>
                   <h1 className="text-3xl font-bold leading-none text-white drop-shadow-lg tracking-tight">TunTaz <span className="text-emerald-400">Madani</span></h1>
                   <p className="text-emerald-100/70 text-xs mt-1 tracking-wide font-medium">YAYASAN TUNAS TAHFIDZ</p>
                </div>
              </div>
              
              <div className="mt-auto">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-[1px] w-8 bg-emerald-400/50"></div>
                  <h3 className="text-lg font-bold text-emerald-50 tracking-wider">Mutiara Hikmah</h3>
                </div>
                
                <div className="relative h-40 bg-black/10 rounded-2xl p-6 border border-white/5 shadow-inner"> 
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={quoteIndex}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ duration: 0.5 }}
                      className="absolute inset-0 p-6 flex flex-col justify-center"
                    >
                      <p className="text-lg font-serif italic leading-relaxed text-white/90 drop-shadow-md">
                        "{ISLAMIC_QUOTES[quoteIndex].text}"
                      </p>
                      <p className="mt-4 text-xs font-bold text-emerald-400 uppercase tracking-widest text-right">
                        — {ISLAMIC_QUOTES[quoteIndex].source}
                      </p>
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel: Role Selection Grid - Transparent & Elegant */}
          <div className="w-full md:w-3/5 p-6 md:p-12 flex flex-col justify-center relative">
             
             {/* Mobile Logo */}
             <div className="md:hidden flex items-center justify-center gap-3 mb-8">
                <h3 className="text-2xl font-bold text-white tracking-tight">TunTaz Madani</h3>
             </div>

             <div className="mb-8 text-center md:text-left">
                <h2 className="text-3xl font-bold text-white drop-shadow-md">Silakan Masuk</h2>
                <p className="text-emerald-100/60 text-sm mt-2 font-light">Pilih jenis akun Anda untuk melanjutkan akses ke sistem.</p>
             </div>

             <div className="grid grid-cols-2 gap-5">
                {/* ADMIN CARD */}
                <motion.button 
                  whileHover={{ scale: 1.02, backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => openModal('admin')} 
                  className="group relative p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm transition-all duration-300 flex flex-col items-center justify-center gap-3 h-32 overflow-hidden hover:border-emerald-500/50 hover:shadow-[0_0_30px_rgba(16,185,129,0.2)]"
                >
                   <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                   <span className="relative z-10 font-medium text-lg text-emerald-50 group-hover:text-white tracking-wide">Administrator</span>
                </motion.button>

                {/* WALI SANTRI CARD */}
                <motion.button 
                  whileHover={{ scale: 1.02, backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => openModal('guardian')} 
                  className="group relative p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm transition-all duration-300 flex flex-col items-center justify-center gap-3 h-32 overflow-hidden hover:border-orange-500/50 hover:shadow-[0_0_30px_rgba(249,115,22,0.2)]"
                >
                   <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                   <span className="relative z-10 font-medium text-lg text-emerald-50 group-hover:text-white tracking-wide">Wali Santri</span>
                </motion.button>

                {/* COMBINED: PENGAJAR & STAF CARD */}
                <motion.button 
                  whileHover={{ scale: 1.02, backgroundColor: "rgba(255, 255, 255, 0.1)" }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => openModal('role_selection')} 
                  className="col-span-2 group relative p-6 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm transition-all duration-300 flex items-center justify-center gap-4 h-24 overflow-hidden hover:border-sky-500/50 hover:shadow-[0_0_30px_rgba(14,165,233,0.2)]"
                >
                   <div className="absolute inset-0 bg-gradient-to-r from-sky-500/10 via-transparent to-sky-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                   <div className="relative z-10 flex items-center gap-4">
                      <span className="font-medium text-lg text-emerald-50 group-hover:text-white tracking-wide">Pengajar & Staf</span>
                   </div>
                </motion.button>
             </div>
          </div>
        </div>
      </div>

      {/* --- MODAL POPUPS (Clean White for Legibility) --- */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
             {/* Backdrop */}
             <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               className="absolute inset-0 bg-black/70 backdrop-blur-md"
               onClick={closeModal}
             />
             
             {/* Modal Content */}
             <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }} 
                animate={{ opacity: 1, scale: 1, y: 0 }} 
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="bg-white rounded-3xl w-full max-w-md relative z-10 shadow-2xl overflow-hidden"
             >
                {/* Header Modal */}
                <div className={`p-6 pb-4 border-b border-slate-100 flex justify-between items-center bg-slate-50`}>
                   <h3 className="text-lg font-bold text-slate-800">
                     {activeModal === 'admin' && 'Login Administrator'}
                     {activeModal === 'teacher' && 'Login Pengajar'}
                     {activeModal === 'staff' && 'Login Staf'}
                     {activeModal === 'guardian' && 'Login Wali Santri'}
                     {activeModal === 'register' && `Pendaftaran ${regRole === 'teacher' ? 'Pengajar' : 'Staf'} Baru`}
                     {activeModal === 'role_selection' && 'Pilih Peran'}
                   </h3>
                   <button onClick={closeModal} className="w-8 h-8 rounded-full bg-slate-200 text-slate-500 flex items-center justify-center hover:bg-slate-300 transition-colors">✕</button>
                </div>

                <div className="p-6">
                   {/* ROLE SELECTION INTERMEDIATE MODAL */}
                   {activeModal === 'role_selection' && (
                     <div className="space-y-4">
                        <p className="text-center text-slate-500 text-sm mb-4">Silakan pilih peran Anda untuk login</p>
                        <div className="grid grid-cols-1 gap-3">
                           <button onClick={() => setActiveModal('teacher')} className="p-4 rounded-xl border-2 border-slate-100 hover:border-emerald-500 hover:bg-emerald-50 transition-all flex items-center gap-4 group">
                              <div className="text-left w-full">
                                 <h4 className="font-bold text-slate-800 group-hover:text-emerald-700 text-center">Pengajar / Ustadz</h4>
                                 <p className="text-xs text-slate-500 text-center mt-1">Login untuk mengakses data kelas</p>
                              </div>
                           </button>
                           <button onClick={() => setActiveModal('staff')} className="p-4 rounded-xl border-2 border-slate-100 hover:border-sky-500 hover:bg-sky-50 transition-all flex items-center gap-4 group">
                              <div className="text-left w-full">
                                 <h4 className="font-bold text-slate-800 group-hover:text-sky-700 text-center">Staf / Tata Usaha</h4>
                                 <p className="text-xs text-slate-500 text-center mt-1">Login untuk administrasi</p>
                              </div>
                           </button>
                        </div>
                     </div>
                   )}

                   {/* ADMIN LOGIN */}
                   {activeModal === 'admin' && (
                     <form onSubmit={handleAdminLogin} className="space-y-5">
                        <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                           <p className="text-xs text-emerald-800 text-center">Masukkan username administrator yang terdaftar.</p>
                        </div>
                        <div>
                           <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Username Admin</label>
                           <input 
                             type="text" 
                             value={username}
                             onChange={(e) => setUsername(e.target.value)}
                             className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white outline-none transition-all text-slate-800 font-bold"
                             placeholder="ex: zazid"
                             autoFocus
                           />
                        </div>
                        <button type="submit" className="w-full py-3.5 bg-slate-800 text-white rounded-xl font-bold shadow-lg shadow-slate-500/30 hover:bg-slate-700 transition-all transform hover:scale-[1.02]">
                           Masuk Admin
                        </button>
                     </form>
                   )}

                   {/* GUARDIAN LOGIN (NIS ONLY) */}
                   {activeModal === 'guardian' && (
                     <form onSubmit={handleGuardianLogin} className="space-y-5">
                        <div className="bg-orange-50 p-3 rounded-lg border border-orange-100">
                           <p className="text-xs text-orange-800 text-center">Gunakan Nomor Induk Santri (NIS) ananda untuk masuk.</p>
                        </div>
                        <div>
                           <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Nomor Induk Santri (NIS)</label>
                           <input 
                             type="text" 
                             value={nis}
                             onChange={(e) => setNis(e.target.value)}
                             className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-orange-500 focus:bg-white outline-none transition-all text-slate-800 font-bold"
                             placeholder="Contoh: 12345"
                             autoFocus
                           />
                        </div>
                        <button type="submit" className="w-full py-3.5 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-xl font-bold shadow-lg shadow-orange-500/30 hover:scale-[1.02] transition-all">
                           Masuk Wali Santri
                        </button>
                     </form>
                   )}

                   {/* STAFF LOGIN (USERNAME ONLY) */}
                   {activeModal === 'staff' && (
                     <form onSubmit={handleStaffLogin} className="space-y-5">
                        <div>
                           <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Username Staf</label>
                           <input 
                             type="text" 
                             value={username}
                             onChange={(e) => setUsername(e.target.value)}
                             className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-sky-500 focus:bg-white outline-none transition-all text-slate-800 font-bold"
                             placeholder="Masukkan username Anda"
                             autoFocus
                           />
                        </div>
                        <button type="submit" className="w-full py-3.5 bg-sky-600 text-white rounded-xl font-bold shadow-lg shadow-sky-500/30 hover:bg-sky-500 transition-all transform hover:scale-[1.02]">
                           Masuk Staf
                        </button>
                        <div className="text-center pt-2">
                           <button type="button" onClick={() => openModal('register', 'staff')} className="text-sm text-sky-600 font-bold hover:underline">Belum punya akun? Daftar Staf</button>
                        </div>
                     </form>
                   )}

                   {/* TEACHER LOGIN (USER/EMAIL + PASSWORD) */}
                   {activeModal === 'teacher' && (
                     <form onSubmit={handleTeacherLogin} className="space-y-5">
                        <div>
                           <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Username / Email</label>
                           <input 
                             type="text" 
                             value={username}
                             onChange={(e) => setUsername(e.target.value)}
                             className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white outline-none transition-all"
                             autoFocus
                           />
                        </div>
                        <div>
                           <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Password</label>
                           <input 
                             type="password" 
                             value={password}
                             onChange={(e) => setPassword(e.target.value)}
                             className="w-full px-5 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:bg-white outline-none transition-all"
                           />
                        </div>
                        <button type="submit" className="w-full py-3.5 bg-emerald-600 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/30 hover:bg-emerald-500 transition-all transform hover:scale-[1.02]">
                           Masuk Pengajar
                        </button>
                        <div className="text-center pt-2">
                           <button type="button" onClick={() => openModal('register', 'teacher')} className="text-sm text-emerald-600 font-bold hover:underline">Belum punya akun? Daftar Pengajar</button>
                        </div>
                     </form>
                   )}

                   {/* REGISTRATION FORM (SCROLLABLE) */}
                   {activeModal === 'register' && (
                     <form onSubmit={handleRegistration} className="space-y-4 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                        <div>
                           <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nama Lengkap</label>
                           <input type="text" value={fullName} onChange={e => setFullName(e.target.value)} className="w-full mt-1 px-4 py-2 rounded-lg bg-slate-50 border border-slate-200 focus:border-emerald-500 outline-none" required />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                           <div>
                              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Username</label>
                              <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full mt-1 px-4 py-2 rounded-lg bg-slate-50 border border-slate-200 focus:border-emerald-500 outline-none" required />
                           </div>
                           <div>
                              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">No. WA</label>
                              <input type="tel" value={whatsapp} onChange={e => setWhatsapp(e.target.value)} className="w-full mt-1 px-4 py-2 rounded-lg bg-slate-50 border border-slate-200 focus:border-emerald-500 outline-none" required />
                           </div>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Email</label>
                            <input type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full mt-1 px-4 py-2 rounded-lg bg-slate-50 border border-slate-200 focus:border-emerald-500 outline-none" required />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Alamat</label>
                            <input type="text" value={address} onChange={e => setAddress(e.target.value)} className="w-full mt-1 px-4 py-2 rounded-lg bg-slate-50 border border-slate-200 focus:border-emerald-500 outline-none" />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cabang</label>
                            <select value={branch} onChange={e => setBranch(e.target.value)} className="w-full mt-1 px-4 py-2 rounded-lg bg-slate-50 border border-slate-200 focus:border-emerald-500 outline-none">
                              <option value="">Pilih Cabang</option>
                              <option value="A">Cabang A</option>
                              <option value="B">Cabang B</option>
                            </select>
                        </div>
                        {regRole === 'teacher' && (
                           <div>
                              <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 block">Kelas yang diajar</label>
                              <div className="flex gap-4">
                                {['Tahsin', 'Tahfidz'].map(type => (
                                  <label key={type} className="flex items-center gap-2 cursor-pointer bg-slate-50 px-3 py-2 rounded-lg border border-slate-200 hover:border-emerald-500 transition-colors">
                                    <input type="checkbox" checked={classTypes.includes(type)} onChange={() => handleClassTypeChange(type)} className="accent-emerald-600 w-4 h-4" />
                                    <span className="text-sm font-medium text-slate-700">{type}</span>
                                  </label>
                                ))}
                              </div>
                           </div>
                        )}
                        <button type="submit" className="w-full py-3 mt-4 bg-slate-800 text-white rounded-xl font-bold shadow-lg hover:bg-slate-700 transition-all transform hover:scale-[1.02]">
                           Daftar Sekarang
                        </button>
                     </form>
                   )}

                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Login;