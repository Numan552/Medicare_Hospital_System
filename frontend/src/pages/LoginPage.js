import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Heart, Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react';
 
// ─── DEMO USERS — works 100% without backend or database ─────
const DEMO_USERS = [
  { id: 1, email: 'admin@medicare.com', password: 'admin123', role: 'admin', first_name: 'System', last_name: 'Administrator', phone: '+1-555-0100', profileId: null },
  { id: 2, email: 'dr.sarah.johnson@medicare.com', password: 'doctor123', role: 'doctor', first_name: 'Sarah', last_name: 'Johnson', phone: '+1-555-0101', profileId: 1 },
  { id: 3, email: 'dr.michael.chen@medicare.com', password: 'doctor123', role: 'doctor', first_name: 'Michael', last_name: 'Chen', phone: '+1-555-0102', profileId: 2 },
  { id: 4, email: 'john.doe@email.com', password: 'patient123', role: 'patient', first_name: 'John', last_name: 'Doe', phone: '+1-555-0201', profileId: 1 },
  { id: 5, email: 'jane.smith@email.com', password: 'patient123', role: 'patient', first_name: 'Jane', last_name: 'Smith', phone: '+1-555-0202', profileId: 2 },
];
 
const getDashboardPath = (role) => ({ admin: '/admin', doctor: '/doctor', patient: '/patient' }[role] || '/');
 
export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
 
  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
 
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) return toast.error('Please enter your email and password');
 
    setLoading(true);
    try {
      // Try real backend first
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.first_name}!`);
      navigate(getDashboardPath(user.role));
    } catch (apiError) {
      // Backend unavailable or wrong creds → try demo mode
      const demoUser = DEMO_USERS.find(
        (u) => u.email.toLowerCase() === form.email.toLowerCase() && u.password === form.password
      );
 
      if (demoUser) {
        const { password, ...safeUser } = demoUser;
        localStorage.setItem('medicare_token', `demo_token_${demoUser.id}`);
        localStorage.setItem('medicare_demo_user', JSON.stringify(safeUser));
        toast.success(`Welcome, ${demoUser.first_name}! (Demo mode)`, { duration: 3000 });
        window.location.href = getDashboardPath(demoUser.role);
      } else {
        const isNetworkError = !apiError.response || apiError.code === 'ERR_NETWORK';
        toast.error(
          isNetworkError
            ? 'Backend offline. Click a demo button below to explore.'
            : apiError.response?.data?.error || 'Invalid email or password.',
          { duration: 5000 }
        );
      }
    } finally {
      setLoading(false);
    }
  };
 
  const demoLogins = [
    { role: 'Admin', email: 'admin@medicare.com', password: 'admin123', color: 'bg-purple-50 dark:bg-purple-900/30 border-purple-200 dark:border-purple-700 text-purple-700 dark:text-purple-300', dot: 'bg-purple-500' },
    { role: 'Doctor', email: 'dr.sarah.johnson@medicare.com', password: 'doctor123', color: 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300', dot: 'bg-blue-500' },
    { role: 'Patient', email: 'john.doe@email.com', password: 'patient123', color: 'bg-teal-50 dark:bg-teal-900/30 border-teal-200 dark:border-teal-700 text-teal-700 dark:text-teal-300', dot: 'bg-teal-500' },
  ];
 
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-teal-50 dark:from-gray-900 dark:via-gray-900 dark:to-blue-950 flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 to-blue-800 p-12 flex-col justify-between relative overflow-hidden">
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-white/10" />
        <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-white/10" />
        <Link to="/" className="flex items-center gap-3 relative z-10">
          <div className="h-10 w-10 bg-white/20 rounded-xl flex items-center justify-center">
            <Heart className="h-6 w-6 text-white" />
          </div>
          <span className="font-display font-bold text-2xl text-white">MediCare</span>
        </Link>
        <div className="relative z-10">
          <h2 className="font-display font-bold text-5xl text-white leading-tight mb-6">
            Your Health Journey <br />Starts Here
          </h2>
          <p className="text-blue-200 text-lg leading-relaxed mb-10">
            Access your medical records, book appointments, and connect with world-class healthcare professionals.
          </p>
          <div className="grid grid-cols-3 gap-4">
            {[{ v: '500+', l: 'Doctors' }, { v: '50K+', l: 'Patients' }, { v: '24/7', l: 'Support' }].map(({ v, l }) => (
              <div key={l} className="text-center bg-white/10 rounded-2xl p-4 border border-white/20">
                <p className="font-display font-bold text-2xl text-white">{v}</p>
                <p className="text-blue-200 text-sm">{l}</p>
              </div>
            ))}
          </div>
        </div>
        <p className="text-blue-300 text-sm relative z-10">© 2024 MediCare Hospital Management System</p>
      </div>
 
      {/* Right Form Panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <Link to="/" className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="h-9 w-9 bg-blue-600 rounded-xl flex items-center justify-center">
              <Heart className="h-5 w-5 text-white" />
            </div>
            <span className="font-display font-bold text-xl text-gray-900 dark:text-white">MediCare</span>
          </Link>
 
          <div className="mb-8">
            <h1 className="font-display font-bold text-3xl text-gray-900 dark:text-white mb-2">Welcome back</h1>
            <p className="text-gray-500 dark:text-gray-400">Sign in to your MediCare account</p>
          </div>
 
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="email" name="email" value={form.email} onChange={handleChange}
                  placeholder="you@example.com" autoComplete="email"
                  className="w-full pl-11 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>
 
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                <Link to="/forgot-password" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">Forgot password?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type={showPass ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange}
                  placeholder="••••••••" autoComplete="current-password"
                  className="w-full pl-11 pr-12 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
 
            <button
              type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-sm hover:shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading
                ? <div className="h-5 w-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                : <><span>Sign In</span><ArrowRight className="h-4 w-4" /></>
              }
            </button>
          </form>
 
          <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">Create account</Link>
          </p>
 
          {/* Demo Credentials Panel */}
          <div className="mt-8 p-5 bg-gray-50 dark:bg-gray-800/80 rounded-2xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2 mb-3">
              <span className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
              <p className="text-xs font-bold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                Quick Demo Access — Click Any Role
              </p>
            </div>
            <div className="space-y-2">
              {demoLogins.map(({ role, email, password, color, dot }) => (
                <button
                  key={role} type="button"
                  onClick={() => { setForm({ email, password }); toast.success(`Filled ${role} credentials — click Sign In!`, { duration: 2000 }); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl border hover:scale-[1.01] active:scale-100 transition-all text-left ${color}`}
                >
                  <span className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ${dot}`} />
                  <span className="font-bold text-sm w-14">{role}</span>
                  <span className="text-xs font-mono opacity-75 truncate flex-1">{email}</span>
                  <span className="text-xs font-mono opacity-60 flex-shrink-0 bg-white/50 dark:bg-black/20 px-2 py-0.5 rounded">{password}</span>
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-3 text-center">
              ✅ Works without backend — full demo mode available
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}